const CropData = require('../models/CropData');
const Analysis = require('../models/Analysis');
const { fetchWeatherForCrop } = require('../services/weatherService');

// @desc    Get weather data for a crop dataset
// @route   GET /api/weather/:cropId
const getWeather = async (req, res) => {
  try {
    const cropData = await CropData.findOne({
      _id: req.params.cropId,
      user: req.user._id
    });
    if (!cropData) {
      return res.status(404).json({ success: false, message: 'Crop dataset not found' });
    }

    const weather = await fetchWeatherForCrop(cropData);

    // Cache the summary on the analysis document if it exists
    const analysis = await Analysis.findOne({ cropData: cropData._id, user: req.user._id });
    if (analysis && weather.summary) {
      analysis.weatherSummary = weather.summary;
      await analysis.save();
    }

    res.json({ success: true, weather });
  } catch (error) {
    console.error('[weatherController]', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWeather };
