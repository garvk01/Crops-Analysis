// /**
//  * Crop Cycle Analysis System — Main Server
//  * Extended with: weather API, insights engine, map location support
//  */
// const express   = require('express');
// const cors      = require('cors');
// const dotenv    = require('dotenv');
// const connectDB = require('./config/db');

// dotenv.config();
// connectDB();

// const app = express();



// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'https://crops-analysis.vercel.app'
//   ],
//   credentials: true
// }))
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// console.log("🔥 NEW CORS CODE ACTIVE");
// // ── Core routes (existing) ──
// app.use('/api/auth',     require('./routes/auth'));
// app.use('/api/data',     require('./routes/data'));
// app.use('/api/analysis', require('./routes/analysis'));

// // ── New feature routes ──
// app.use('/api/weather',  require('./routes/weather'));
// app.use('/api/insights', require('./routes/insights'));

// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Crop Cycle API running', version: '2.0' });
// });

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🌱 CropCycle v2 running on port ${PORT}`));
// -------------------------------------------------------------------------------------------
/**
 * Crop Cycle Analysis System — Main Server
 * Production-ready with CORS fix
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

/**
 * ✅ CORS CONFIG (FIXED)
 * Allows both local + deployed frontend
 */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://crops-analysis.vercel.app'
  ],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug log to confirm deployment
console.log("🔥 NEW CORS CODE ACTIVE");

// ─────────────────────────────
// 📌 ROUTES
// ─────────────────────────────

// Core routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));
app.use('/api/analysis', require('./routes/analysis'));

// Feature routes
app.use('/api/weather', require('./routes/weather'));
app.use('/api/insights', require('./routes/insights'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Crop Cycle API running',
    version: '2.0'
  });
});

// ─────────────────────────────
// ❌ ERROR HANDLER
// ─────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─────────────────────────────
// 🚀 START SERVER
// ─────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌱 CropCycle v2 running on port ${PORT}`);
});