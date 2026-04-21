const mongoose = require('mongoose');

// Individual NDVI data point
const NDVIPointSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  ndvi: { type: Number, required: true, min: -1, max: 1 }
}, { _id: false });

const CropDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Unnamed Dataset'
  },
  description: { type: String, trim: true },
  cropType: {
    type: String,
    enum: ['wheat', 'rice', 'corn', 'soybean', 'cotton', 'other'],
    default: 'other'
  },
  location: {
    lat: Number,
    lng: Number,
    label: String
  },
  timeSeries: [NDVIPointSchema],
  source: {
    type: String,
    enum: ['upload', 'demo'],
    default: 'upload'
  },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CropData', CropDataSchema);
