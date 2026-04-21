const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['delayed_growth','low_peak_ndvi','sudden_drop','poor_rainfall',
           'early_harvest','excellent_season','drought_stress','info'],
    required: true
  },
  severity: { type: String, enum: ['info','warning','critical','success'], default: 'info' },
  title:    { type: String, required: true },
  message:  { type: String, required: true },
  metric:   { type: String }
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropData: { type: mongoose.Schema.Types.ObjectId, ref: 'CropData', required: true },
  stages: {
    growthStart: { date: Date, ndvi: Number, confidence: Number },
    peakGrowth:  { date: Date, ndvi: Number, confidence: Number },
    harvest:     { date: Date, ndvi: Number, confidence: Number }
  },
  metrics: {
    cropHealthScore:    { type: Number, min: 0, max: 100 },
    growingSeasonDays:  Number,
    averageNDVI:        Number,
    maxNDVI:            Number,
    minNDVI:            Number,
    ndviVariance:       Number,
    vegetationCoverage: String
  },
  phases: [{ name: String, startDate: Date, endDate: Date, color: String }],
  insights:       [InsightSchema],
  weatherSummary: {
    avgTemp:     Number,
    totalRain:   Number,
    avgHumidity: Number,
    fetchedAt:   Date
  },
  analyzedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
