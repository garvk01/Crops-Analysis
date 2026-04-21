/**
 * insightsService.js
 * Rule-based smart insights engine.
 * Generates human-readable agricultural observations from NDVI analysis + weather.
 * Pure logic — no ML required.
 */

// Thresholds (tunable)
const THRESHOLDS = {
  GROWTH_DELAY_DAYS:    21,    // growth start considered "delayed" if > 21 days past crop norm
  LOW_PEAK_NDVI:        0.55,  // peak below this = poor canopy
  EXCELLENT_PEAK_NDVI:  0.75,  // peak above = strong season
  SUDDEN_DROP_DELTA:    0.15,  // NDVI drop between consecutive points = stress event
  SHORT_SEASON_DAYS:    90,    // season < 90d = early harvest / stress
  LONG_SEASON_DAYS:     170,   // season > 170d = unusually long
  LOW_RAIN_MM:          150,   // total seasonal rain < 150mm = drought risk
  HIGH_RAIN_MM:         900,   // > 900mm = excess rainfall
  LOW_VARIANCE:         0.01,  // very flat NDVI = poor growth response
  CONF_THRESHOLD:       65     // stage confidence below this = flag as uncertain
};

// Crop-specific expected growth start month (0-indexed) and typical season days
const CROP_NORMS = {
  wheat:   { startMonth: 10, seasonDays: 150 }, // Nov sowing
  rice:    { startMonth: 5,  seasonDays: 120 }, // Jun sowing
  corn:    { startMonth: 5,  seasonDays: 105 },
  soybean: { startMonth: 5,  seasonDays: 100 },
  cotton:  { startMonth: 3,  seasonDays: 180 },
  other:   { startMonth: 5,  seasonDays: 120 }
};

/**
 * Detect sudden NDVI drops between consecutive time-series points
 */
function detectSuddenDrops(timeSeries) {
  const drops = [];
  const sorted = [...timeSeries].sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = 1; i < sorted.length; i++) {
    const delta = sorted[i - 1].ndvi - sorted[i].ndvi;
    if (delta >= THRESHOLDS.SUDDEN_DROP_DELTA) {
      drops.push({
        date:  sorted[i].date,
        delta: +delta.toFixed(3),
        from:  +sorted[i - 1].ndvi.toFixed(3),
        to:    +sorted[i].ndvi.toFixed(3)
      });
    }
  }
  return drops;
}

/**
 * Main insights generator
 * @param {Object} analysisResult - output from analysisService.analyzeCropCycle
 * @param {Object} cropData       - Mongoose CropData document
 * @param {Object} weatherSummary - { totalRain, avgTemp, avgHumidity } from weatherService
 * @returns {Array} insights array
 */
function generateInsights(analysisResult, cropData, weatherSummary = {}) {
  const insights = [];
  const { stages, metrics, timeSeries } = analysisResult;
  const cropType = cropData.cropType || 'other';
  const norm     = CROP_NORMS[cropType] || CROP_NORMS.other;

  // ── 1. Excellent season ──
  if (metrics.maxNDVI >= THRESHOLDS.EXCELLENT_PEAK_NDVI && metrics.cropHealthScore >= 72) {
    insights.push({
      type:     'excellent_season',
      severity: 'success',
      title:    'Strong crop season detected',
      message:  `Peak NDVI of ${metrics.maxNDVI.toFixed(2)} indicates excellent canopy development and robust growth. Health score of ${metrics.cropHealthScore}/100.`,
      metric:   `NDVI ${metrics.maxNDVI.toFixed(2)}`
    });
  }

  // ── 2. Low peak NDVI ──
  if (metrics.maxNDVI < THRESHOLDS.LOW_PEAK_NDVI) {
    insights.push({
      type:     'low_peak_ndvi',
      severity: 'warning',
      title:    'Below-average canopy density',
      message:  `Peak NDVI of ${metrics.maxNDVI.toFixed(2)} is below the ${THRESHOLDS.LOW_PEAK_NDVI} threshold. This may indicate poor stand establishment, nutrient deficiency, or pest pressure. Consider soil testing.`,
      metric:   `Peak ${metrics.maxNDVI.toFixed(2)}`
    });
  }

  // ── 3. Delayed growth start ──
  if (stages.growthStart?.date) {
    const gsMonth = new Date(stages.growthStart.date).getMonth();
    const monthDiff = Math.abs(gsMonth - norm.startMonth);
    const delayDays = monthDiff * 30;
    if (delayDays > THRESHOLDS.GROWTH_DELAY_DAYS) {
      insights.push({
        type:     'delayed_growth',
        severity: 'warning',
        title:    'Growth start delayed',
        message:  `Crop growth began approximately ${delayDays} days later than the typical window for ${cropType}. Late sowing may reduce yield potential and expose the crop to unfavourable terminal temperatures.`,
        metric:   `~${delayDays}d late`
      });
    }
  }

  // ── 4. Sudden NDVI drops (crop stress events) ──
  const drops = detectSuddenDrops(timeSeries || cropData.timeSeries || []);
  const severeDrops = drops.filter(d => d.delta >= THRESHOLDS.SUDDEN_DROP_DELTA * 1.5); // extra severe
  if (severeDrops.length > 0) {
    const worst = severeDrops.sort((a, b) => b.delta - a.delta)[0];
    const dropDate = new Date(worst.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    insights.push({
      type:     'sudden_drop',
      severity: 'critical',
      title:    'Crop stress event detected',
      message:  `A rapid NDVI decline of ${worst.delta} was detected around ${dropDate} (from ${worst.from} → ${worst.to}). This may indicate drought stress, pest/disease outbreak, or waterlogging. Cross-check with field records.`,
      metric:   `−${worst.delta} NDVI`
    });
  } else if (drops.length > 0) {
    insights.push({
      type:     'sudden_drop',
      severity: 'warning',
      title:    'Minor NDVI fluctuations detected',
      message:  `${drops.length} consecutive NDVI dip(s) found during the season. Likely caused by cloud cover in satellite imagery or minor water stress. Monitor closely.`,
      metric:   `${drops.length} dip(s)`
    });
  }

  // ── 5. Short growing season ──
  if (metrics.growingSeasonDays < THRESHOLDS.SHORT_SEASON_DAYS) {
    insights.push({
      type:     'early_harvest',
      severity: 'warning',
      title:    'Unusually short growing season',
      message:  `Season lasted only ${metrics.growingSeasonDays} days, well below the typical ${norm.seasonDays} days for ${cropType}. Early senescence may have been triggered by heat stress, water deficit, or disease.`,
      metric:   `${metrics.growingSeasonDays}d season`
    });
  }

  // ── 6. Weather: drought stress ──
  if (weatherSummary.totalRain !== undefined && weatherSummary.totalRain < THRESHOLDS.LOW_RAIN_MM) {
    insights.push({
      type:     'drought_stress',
      severity: 'critical',
      title:    'Low seasonal rainfall — drought risk',
      message:  `Total seasonal rainfall of ${weatherSummary.totalRain.toFixed(0)} mm is significantly below the minimum recommended for ${cropType} (${THRESHOLDS.LOW_RAIN_MM} mm). Supplemental irrigation may have been essential.`,
      metric:   `${weatherSummary.totalRain.toFixed(0)} mm`
    });
  } else if (weatherSummary.totalRain !== undefined && weatherSummary.totalRain > THRESHOLDS.HIGH_RAIN_MM) {
    insights.push({
      type:     'poor_rainfall',
      severity: 'warning',
      title:    'Excess rainfall detected',
      message:  `Seasonal total of ${weatherSummary.totalRain.toFixed(0)} mm exceeds ${THRESHOLDS.HIGH_RAIN_MM} mm. Waterlogging or fungal disease pressure may have affected yield. Check drainage records.`,
      metric:   `${weatherSummary.totalRain.toFixed(0)} mm`
    });
  }

  // ── 7. Low variance (flat NDVI — no real growth) ──
  if (metrics.ndviVariance < THRESHOLDS.LOW_VARIANCE) {
    insights.push({
      type:     'info',
      severity: 'info',
      title:    'Low NDVI variability',
      message:  `NDVI variance of ${metrics.ndviVariance.toFixed(4)} is unusually low. The field may have had consistently bare or sparse vegetation, or data quality issues may be present.`,
      metric:   `σ² ${metrics.ndviVariance.toFixed(4)}`
    });
  }

  // ── 8. Low confidence warning ──
  const lowConfStages = [];
  if (stages.growthStart?.confidence < THRESHOLDS.CONF_THRESHOLD) lowConfStages.push('growth start');
  if (stages.peakGrowth?.confidence  < THRESHOLDS.CONF_THRESHOLD) lowConfStages.push('peak growth');
  if (stages.harvest?.confidence     < THRESHOLDS.CONF_THRESHOLD) lowConfStages.push('harvest');
  if (lowConfStages.length > 0) {
    insights.push({
      type:     'info',
      severity: 'info',
      title:    'Low stage detection confidence',
      message:  `The following stages had below-threshold detection confidence: ${lowConfStages.join(', ')}. More data points or a longer time series would improve accuracy.`,
      metric:   `${lowConfStages.length} stage(s)`
    });
  }

  return insights;
}

module.exports = { generateInsights };
