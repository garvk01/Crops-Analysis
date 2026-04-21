const Analysis = require('../models/Analysis');
const CropData  = require('../models/CropData');
const { generateInsights } = require('../services/insightsService');
const { analyzeCropCycle }  = require('../services/analysisService');

// @desc    Get insights for an analysis (generate if missing)
// @route   GET /api/insights/:cropDataId
const getInsights = async (req, res) => {
  try {
    const cropData = await CropData.findOne({
      _id: req.params.cropDataId,
      user: req.user._id
    });
    if (!cropData) {
      return res.status(404).json({ success: false, message: 'Crop dataset not found' });
    }

    const analysis = await Analysis.findOne({
      cropData: cropData._id,
      user: req.user._id
    });
    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found. Run analysis first.' });
    }

    // If insights already generated, return them
    if (analysis.insights && analysis.insights.length > 0) {
      return res.json({ success: true, insights: analysis.insights });
    }

    // Generate insights now
    const ts            = cropData.timeSeries.map(p => ({ date: new Date(p.date), ndvi: p.ndvi }));
    const analysisResult = analyzeCropCycle(ts);
    const insights       = generateInsights(analysisResult, cropData, analysis.weatherSummary || {});

    analysis.insights = insights;
    await analysis.save();

    res.json({ success: true, insights });
  } catch (error) {
    console.error('[insightsController]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Regenerate insights (force refresh)
// @route   POST /api/insights/:cropDataId/refresh
const refreshInsights = async (req, res) => {
  try {
    const cropData = await CropData.findOne({ _id: req.params.cropDataId, user: req.user._id });
    if (!cropData) return res.status(404).json({ success: false, message: 'Not found' });

    const analysis = await Analysis.findOne({ cropData: cropData._id, user: req.user._id });
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });

    const ts             = cropData.timeSeries.map(p => ({ date: new Date(p.date), ndvi: p.ndvi }));
    const analysisResult = analyzeCropCycle(ts);
    const insights        = generateInsights(analysisResult, cropData, analysis.weatherSummary || {});

    analysis.insights = insights;
    await analysis.save();

    res.json({ success: true, insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInsights, refreshInsights };
