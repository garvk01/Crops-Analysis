# 🌱 CropCycle — Crop Cycle Analysis System

A full-stack web application for multi-temporal NDVI data analysis, crop stage detection, and agricultural insights.

---

## 📁 Project Structure

```
crop-cycle-app/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register / Login / GetMe
│   │   ├── dataController.js      # Upload, Demo, CRUD
│   │   └── analysisController.js  # Fetch analysis results
│   ├── middleware/
│   │   └── auth.js                # JWT protection middleware
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── CropData.js            # NDVI time-series schema
│   │   └── Analysis.js            # Detected stages + metrics
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── data.js                # /api/data/*
│   │   └── analysis.js            # /api/analysis/*
│   ├── services/
│   │   └── analysisService.js     # 🔬 Core crop cycle engine
│   ├── sample_data/
│   │   └── wheat_punjab_sample.csv
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── index.html                 # Complete standalone frontend
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI and JWT_SECRET
npm run dev
# → Server starts on http://localhost:5000
```

### 2. Frontend (Vite + React)

> The provided `index.html` is a standalone demo that runs without a backend.
> For full stack, create a React/Vite project:

```bash
cd frontend
npm install
npm run dev
# → Frontend starts on http://localhost:5173
```

Or open `frontend/index.html` directly in any browser for the standalone demo.

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/data/upload` | Upload CSV file (multipart) |
| POST | `/api/data/demo` | Load demo dataset |
| GET | `/api/data` | List all user datasets |
| GET | `/api/data/:id` | Get dataset with time series |
| DELETE | `/api/data/:id` | Delete dataset + analysis |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analysis` | All analyses for user |
| GET | `/api/analysis/:cropDataId` | Analysis for a dataset |

---

## 🔬 Analysis Engine

The core algorithm in `services/analysisService.js`:

1. **Smoothing** — 3-point moving average to reduce sensor noise
2. **Growth Start** — First point crossing 25th percentile of NDVI range with upward trend
3. **Peak Growth** — Global NDVI maximum in the smoothed series
4. **Harvest Stage** — First sustained descent below 35th percentile after peak
5. **Health Score** — Composite of peak NDVI (40pts), avg NDVI (30pts), season length (20pts), confidence (10pts)
6. **Phase Segmentation** — 5 phases: Dormant → Growing → Peak → Declining → Harvest

---

## 📊 CSV Format

```csv
date,ndvi
2023-11-01,0.12
2023-12-01,0.31
2024-01-15,0.55
2024-03-15,0.85
2024-05-01,0.35
```

---

## ☁️ Deployment

### Backend → Render.com
1. Push backend folder to GitHub
2. Create new Web Service on Render
3. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`
4. Build command: `npm install` · Start: `npm start`

### Frontend → Vercel
1. Push frontend folder to GitHub
2. Import to Vercel
3. Set `VITE_API_URL` environment variable to your Render backend URL
4. Framework preset: Vite

---

## 🌿 Demo Datasets

| Dataset | Crop | Location | Points |
|---------|------|----------|--------|
| wheat_india | Wheat | Punjab, India | 15 |
| rice_kerala | Rice | Kerala, India | 13 |
| corn_maharashtra | Corn | Maharashtra, India | 12 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts/Chart.js |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Upload | Multer (CSV parsing) |
| Styling | Custom CSS, CSS Variables |

---

## 📝 License

MIT — Built for academic evaluation and agricultural research.
