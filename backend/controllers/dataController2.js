const { parse } = require('csv-parse/sync');
const CropData = require('../models/CropData');
const Analysis = require('../models/Analysis');
const { analyzeCropCycle }   = require('../services/analysisService');
const { generateInsights }   = require('../services/insightsService');
const { fetchWeatherForCrop } = require('../services/weatherService');

// Demo datasets
const DEMO_DATASETS = {
  wheat_india: {
    name: 'Wheat - Punjab, India (2023)',
    cropType: 'wheat',
    location: { lat: 30.9, lng: 75.8, label: 'Punjab, India' },
    data: [
      { date: '2023-11-01', ndvi: 0.12 }, { date: '2023-11-15', ndvi: 0.15 },
      { date: '2023-12-01', ndvi: 0.22 }, { date: '2023-12-15', ndvi: 0.31 },
      { date: '2024-01-01', ndvi: 0.42 }, { date: '2024-01-15', ndvi: 0.55 },
      { date: '2024-02-01', ndvi: 0.67 }, { date: '2024-02-15', ndvi: 0.76 },
      { date: '2024-03-01', ndvi: 0.82 }, { date: '2024-03-15', ndvi: 0.85 },
      { date: '2024-04-01', ndvi: 0.80 }, { date: '2024-04-15', ndvi: 0.70 },
      { date: '2024-05-01', ndvi: 0.52 }, { date: '2024-05-15', ndvi: 0.35 },
      { date: '2024-06-01', ndvi: 0.18 }
    ]
  },
  rice_kerala: {
    name: 'Rice - Kerala, India (2023)',
    cropType: 'rice',
    location: { lat: 10.8, lng: 76.2, label: 'Kerala, India' },
    data: [
      { date: '2023-06-01', ndvi: 0.10 }, { date: '2023-06-15', ndvi: 0.18 },
      { date: '2023-07-01', ndvi: 0.30 }, { date: '2023-07-15', ndvi: 0.48 },
      { date: '2023-08-01', ndvi: 0.62 }, { date: '2023-08-15', ndvi: 0.74 },
      { date: '2023-09-01', ndvi: 0.81 }, { date: '2023-09-15', ndvi: 0.78 },
      { date: '2023-10-01', ndvi: 0.68 }, { date: '2023-10-15', ndvi: 0.55 },
      { date: '2023-11-01', ndvi: 0.38 }, { date: '2023-11-15', ndvi: 0.22 },
      { date: '2023-12-01', ndvi: 0.13 }
    ]
  },
  corn_maharashtra: {
    name: 'Corn - Maharashtra, India (2023)',
    cropType: 'corn',
    location: { lat: 19.6, lng: 74.3, label: 'Maharashtra, India' },
    data: [
      { date: '2023-06-15', ndvi: 0.08 }, { date: '2023-07-01', ndvi: 0.20 },
      { date: '2023-07-15', ndvi: 0.38 }, { date: '2023-08-01', ndvi: 0.58 },
      { date: '2023-08-15', ndvi: 0.72 }, { date: '2023-09-01', ndvi: 0.84 },
      { date: '2023-09-15', ndvi: 0.88 }, { date: '2023-10-01', ndvi: 0.83 },
      { date: '2023-10-15', ndvi: 0.71 }, { date: '2023-11-01', ndvi: 0.55 },
      { date: '2023-11-15', ndvi: 0.38 }, { date: '2023-12-01', ndvi: 0.20 }
    ]
  }
};

// @desc    Upload CSV and run analysis
// @route   POST /api/data/upload
const uploadData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const content = req.file.buffer.toString();
    const records = parse(content, { columns: true, skip_empty_lines: true });

    // Validate and normalize
    const timeSeries = records.map((row, i) => {
      const date = new Date(row.date || row.Date || row.DATE);
      const ndvi = parseFloat(row.ndvi || row.NDVI || row.value);
      if (isNaN(date.getTime())) throw new Error(`Invalid date at row ${i + 1}`);
      if (isNaN(ndvi)) throw new Error(`Invalid NDVI at row ${i + 1}`);
      return { date, ndvi };
    });

    // Parse optional location fields sent from the Upload form
    const lat = parseFloat(req.body.lat)
    const lng = parseFloat(req.body.lng)
    const locationData = (!isNaN(lat) && !isNaN(lng))
      ? { lat, lng, label: req.body.locationLabel || '' }
      : undefined

    const cropData = await CropData.create({
      user: req.user._id,
      name: req.body.name || req.file.originalname,
      cropType: req.body.cropType || 'other',
      timeSeries,
      source: 'upload',
      ...(locationData && { location: locationData })
    });

    // Auto-run analysis
    const result = analyzeCropCycle(timeSeries);

    // Auto-generate insights
    const insights = generateInsights(result, { cropType: req.body.cropType || 'other', timeSeries });

    // Fetch weather (non-blocking — don't fail upload on API error)
    let weatherSummary;
    try { weatherSummary = (await fetchWeatherForCrop(cropData)).summary; } catch(_) {}

    const analysis = await Analysis.create({
      user: req.user._id,
      cropData: cropData._id,
      ...result,
      insights,
      weatherSummary
    });

    res.status(201).json({ success: true, cropData, analysis });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Load a demo dataset and run analysis
// @route   POST /api/data/demo
const loadDemo = async (req, res) => {
  try {
    const { demoKey } = req.body;
    const demo = DEMO_DATASETS[demoKey];
    if (!demo) {
      return res.status(400).json({ success: false, message: 'Invalid demo key' });
    }

    const timeSeries = demo.data.map(d => ({ date: new Date(d.date), ndvi: d.ndvi }));

    const cropData = await CropData.create({
      user: req.user._id,
      name: demo.name,
      cropType: demo.cropType,
      location: demo.location,
      timeSeries,
      source: 'demo'
    });

    const result = analyzeCropCycle(timeSeries);

    // Auto-generate insights
    const insights = generateInsights(result, { cropType: req.body.cropType || 'other', timeSeries });

    // Fetch weather (non-blocking — don't fail upload on API error)
    let weatherSummary;
    try { weatherSummary = (await fetchWeatherForCrop(cropData)).summary; } catch(_) {}

    const analysis = await Analysis.create({
      user: req.user._id,
      cropData: cropData._id,
      ...result,
      insights,
      weatherSummary
    });

    res.status(201).json({ success: true, cropData, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all datasets for the current user
// @route   GET /api/data
const getAllData = async (req, res) => {
  try {
    const datasets = await CropData.find({ user: req.user._id })
      .sort({ uploadedAt: -1 })
      .select('-timeSeries'); // Exclude raw data for list view
    res.json({ success: true, datasets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single dataset with time series
// @route   GET /api/data/:id
const getDataById = async (req, res) => {
  try {
    const cropData = await CropData.findOne({ _id: req.params.id, user: req.user._id });
    if (!cropData) {
      return res.status(404).json({ success: false, message: 'Dataset not found' });
    }
    res.json({ success: true, cropData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a dataset and its analysis
// @route   DELETE /api/data/:id
const deleteData = async (req, res) => {
  try {
    const cropData = await CropData.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!cropData) {
      return res.status(404).json({ success: false, message: 'Dataset not found' });
    }
    await Analysis.deleteMany({ cropData: req.params.id });
    res.json({ success: true, message: 'Dataset deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadData, loadDemo, getAllData, getDataById, deleteData };
