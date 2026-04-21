/**
 * Crop Cycle Analysis Service
 * Core logic for detecting crop growth stages from NDVI time-series data
 */

/**
 * Apply moving average smoothing to NDVI values
 * Reduces noise in the signal for more reliable stage detection
 */
const smoothNDVI = (series, windowSize = 3) => {
  return series.map((point, i) => {
    const half = Math.floor(windowSize / 2);
    const start = Math.max(0, i - half);
    const end = Math.min(series.length - 1, i + half);
    const slice = series.slice(start, end + 1);
    const avg = slice.reduce((sum, p) => sum + p.ndvi, 0) / slice.length;
    return { ...point, ndvi: avg };
  });
};

/**
 * Detect the growth start: first consistent upward trend after a low baseline
 */
const detectGrowthStart = (smoothed) => {
  const minNDVI = Math.min(...smoothed.map(p => p.ndvi));
  const maxNDVI = Math.max(...smoothed.map(p => p.ndvi));
  const threshold = minNDVI + (maxNDVI - minNDVI) * 0.25; // 25% above baseline

  for (let i = 1; i < smoothed.length - 2; i++) {
    if (
      smoothed[i].ndvi > threshold &&
      smoothed[i].ndvi > smoothed[i - 1].ndvi &&
      smoothed[i + 1].ndvi > smoothed[i].ndvi
    ) {
      const confidence = Math.min(100, Math.round(
        ((smoothed[i].ndvi - minNDVI) / (maxNDVI - minNDVI)) * 80 + 20
      ));
      return { date: smoothed[i].date, ndvi: smoothed[i].ndvi, confidence };
    }
  }
  // Fallback: first point
  return { date: smoothed[0].date, ndvi: smoothed[0].ndvi, confidence: 50 };
};

/**
 * Detect peak growth: the point with maximum NDVI
 */
const detectPeakGrowth = (smoothed) => {
  let peak = smoothed[0];
  for (const point of smoothed) {
    if (point.ndvi > peak.ndvi) peak = point;
  }
  const confidence = Math.min(100, Math.round(peak.ndvi * 100 + 40));
  return { date: peak.date, ndvi: peak.ndvi, confidence };
};

/**
 * Detect harvest stage: sustained decline after peak
 */
const detectHarvest = (smoothed, peakDate) => {
  const peakIndex = smoothed.findIndex(p => p.date.toString() === peakDate.toString());
  const postPeak = smoothed.slice(peakIndex + 1);

  if (postPeak.length === 0) {
    const last = smoothed[smoothed.length - 1];
    return { date: last.date, ndvi: last.ndvi, confidence: 40 };
  }

  const maxNDVI = Math.max(...smoothed.map(p => p.ndvi));
  const minNDVI = Math.min(...smoothed.map(p => p.ndvi));
  const harvestThreshold = minNDVI + (maxNDVI - minNDVI) * 0.35;

  for (let i = 1; i < postPeak.length; i++) {
    if (
      postPeak[i].ndvi < harvestThreshold &&
      postPeak[i].ndvi < postPeak[i - 1].ndvi
    ) {
      const dropRatio = (maxNDVI - postPeak[i].ndvi) / (maxNDVI - minNDVI);
      const confidence = Math.min(100, Math.round(dropRatio * 90 + 10));
      return { date: postPeak[i].date, ndvi: postPeak[i].ndvi, confidence };
    }
  }

  const last = postPeak[postPeak.length - 1];
  return { date: last.date, ndvi: last.ndvi, confidence: 55 };
};

/**
 * Calculate crop health score (0–100)
 * Based on peak NDVI, season length, and variability
 */
const calculateHealthScore = (series, stages) => {
  const maxNDVI = Math.max(...series.map(p => p.ndvi));
  const avgNDVI = series.reduce((s, p) => s + p.ndvi, 0) / series.length;

  // Components
  const peakScore = Math.min(40, maxNDVI * 50);        // max 40 pts
  const avgScore = Math.min(30, avgNDVI * 40);          // max 30 pts
  const seasonDays = stages.growthStart && stages.harvest
    ? (new Date(stages.harvest.date) - new Date(stages.growthStart.date)) / 86400000
    : 0;
  const seasonScore = Math.min(20, seasonDays / 10);    // max 20 pts
  const confidenceScore = ((stages.growthStart.confidence + stages.peakGrowth.confidence + stages.harvest.confidence) / 3) * 0.1; // max 10 pts

  return Math.round(peakScore + avgScore + seasonScore + confidenceScore);
};

/**
 * Determine vegetation coverage category
 */
const getVegetationCoverage = (maxNDVI) => {
  if (maxNDVI >= 0.7) return 'Excellent';
  if (maxNDVI >= 0.5) return 'Good';
  if (maxNDVI >= 0.3) return 'Fair';
  return 'Poor';
};

/**
 * Segment the time series into phases for chart highlighting
 */
const buildPhases = (series, stages) => {
  const { growthStart, peakGrowth, harvest } = stages;
  const first = series[0].date;
  const last = series[series.length - 1].date;

  return [
    { name: 'dormant',   startDate: first,              endDate: growthStart.date, color: '#94a3b8' },
    { name: 'growing',   startDate: growthStart.date,   endDate: peakGrowth.date,  color: '#4ade80' },
    { name: 'peak',      startDate: peakGrowth.date,    endDate: peakGrowth.date,  color: '#22c55e' },
    { name: 'declining', startDate: peakGrowth.date,    endDate: harvest.date,     color: '#facc15' },
    { name: 'harvest',   startDate: harvest.date,       endDate: last,             color: '#f97316' }
  ];
};

/**
 * Main analysis function
 * @param {Array} timeSeries - Array of { date, ndvi } objects
 * @returns {Object} Full analysis result
 */
const analyzeCropCycle = (timeSeries) => {
  if (!timeSeries || timeSeries.length < 5) {
    throw new Error('Not enough data points for analysis (minimum 5 required)');
  }

  // Sort by date ascending
  const sorted = [...timeSeries].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Smooth the signal
  const smoothed = smoothNDVI(sorted, 3);

  // Detect stages
  const growthStart = detectGrowthStart(smoothed);
  const peakGrowth = detectPeakGrowth(smoothed);
  const harvest = detectHarvest(smoothed, peakGrowth.date);

  const stages = { growthStart, peakGrowth, harvest };

  // Compute metrics
  const ndviValues = sorted.map(p => p.ndvi);
  const maxNDVI = Math.max(...ndviValues);
  const minNDVI = Math.min(...ndviValues);
  const avgNDVI = ndviValues.reduce((s, v) => s + v, 0) / ndviValues.length;
  const variance = ndviValues.reduce((s, v) => s + Math.pow(v - avgNDVI, 2), 0) / ndviValues.length;
  const growingSeasonDays = Math.round(
    (new Date(harvest.date) - new Date(growthStart.date)) / 86400000
  );

  const metrics = {
    cropHealthScore: calculateHealthScore(sorted, stages),
    growingSeasonDays,
    averageNDVI: parseFloat(avgNDVI.toFixed(3)),
    maxNDVI: parseFloat(maxNDVI.toFixed(3)),
    minNDVI: parseFloat(minNDVI.toFixed(3)),
    ndviVariance: parseFloat(variance.toFixed(4)),
    vegetationCoverage: getVegetationCoverage(maxNDVI)
  };

  const phases = buildPhases(sorted, stages);

  return { stages, metrics, phases };
};

module.exports = { analyzeCropCycle };
