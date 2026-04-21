const Analysis = require('../models/Analysis');
const CropData = require('../models/CropData');

// @desc    Get analysis by crop data ID
// @route   GET /api/analysis/:cropDataId
const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      cropData: req.params.cropDataId,
      user: req.user._id
    }).populate('cropData', 'name cropType timeSeries location');

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all analyses for user
// @route   GET /api/analysis
const getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .populate('cropData', 'name cropType location uploadedAt')
      .sort({ analyzedAt: -1 });
    res.json({ success: true, analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalysis, getAllAnalyses };
