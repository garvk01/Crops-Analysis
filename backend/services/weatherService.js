

// -----------------------------------------------------------------------------------------------
const axios = require('axios');

// ================= CONFIG =================
const API_KEY = process.env.OPENWEATHER_API_KEY;
const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

// ================= REGIONAL CLIMATE DATA =================
const REGIONAL_CLIMATE = {
  punjab: {
    rain: [15, 12, 18, 8, 6, 4, 80, 90, 30, 10, 5, 10],
    temp: [14, 17, 22, 28, 33, 37, 32, 30, 28, 23, 18, 15]
  },
  kerala: {
    rain: [30, 25, 40, 90, 300, 650, 700, 500, 300, 250, 180, 50],
    temp: [27, 28, 29, 30, 29, 28, 27, 27, 27, 28, 28, 28]
  },
  maharashtra: {
    rain: [5, 4, 4, 8, 20, 100, 300, 250, 150, 30, 10, 5],
    temp: [23, 25, 28, 32, 35, 30, 26, 26, 26, 28, 26, 24]
  },
  default: {
    rain: [30, 25, 30, 25, 30, 60, 120, 100, 80, 50, 30, 20],
    temp: [22, 24, 27, 30, 32, 30, 28, 28, 27, 26, 24, 22]
  }
};

// ================= HELPER FUNCTIONS =================
function getRegionKey(label = '') {
  const l = label.toLowerCase();
  if (l.includes('punjab') || l.includes('haryana')) return 'punjab';
  if (l.includes('kerala')) return 'kerala';
  if (l.includes('maharashtra')) return 'maharashtra';
  return 'default';
}

// ================= MAIN FUNCTION =================
async function buildMonthlyWeather(lat, lng, startDate, endDate, locationLabel) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  let currentTemp = null;
  let currentHumidity = null;

  // ✅ Try to fetch current weather from API (with timeout)
  if (apiKey && apiKey !== 'your_openweathermap_api_key_here') {
    try {
      const url = `${OWM_BASE}/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
      const response = await axios.get(url, {
        timeout: 5000,  // 5 second timeout
        headers: { 'User-Agent': 'CropCycle-App/1.0' }
      });

      if (response.data) {
        currentTemp = response.data.main?.temp ?? null;
        currentHumidity = response.data.main?.humidity ?? null;
        console.log(`✅ [Weather] Got current weather: temp=${currentTemp}°C, humidity=${currentHumidity}%`);
      }
    } catch (err) {
      console.warn(`⚠️ [Weather] API failed, using seasonal fallback: ${err.message}`);
    }
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const region = REGIONAL_CLIMATE[getRegionKey(locationLabel)] || REGIONAL_CLIMATE.default;

  const series = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  // ✅ Build monthly weather series
  while (cursor <= end) {
    const monthIdx = cursor.getMonth();

    // Use current temp for first month if available, else use seasonal
    const temp = currentTemp !== null && series.length === 0
      ? currentTemp
      : region.temp[monthIdx] + (Math.random() * 2 - 1);

    const rain = region.rain[monthIdx] * (0.85 + Math.random() * 0.3);

    const humidity = currentHumidity !== null && series.length === 0
      ? currentHumidity
      : 55 + Math.random() * 30;

    series.push({
      month: cursor.toLocaleString('en-IN', { month: 'short' }),
      avgTemp: +temp.toFixed(1),
      totalRain: +rain.toFixed(1),
      humidity: Math.round(humidity)
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  // ✅ Calculate seasonal averages from the series
  const avgTemp = series.length
    ? Math.round(series.reduce((s, m) => s + m.avgTemp, 0) / series.length)
    : null;

  const totalRain = series.reduce((s, m) => s + m.totalRain, 0);

  const avgHumidity = series.length
    ? Math.round(series.reduce((s, m) => s + m.humidity, 0) / series.length)
    : null;

  // ✅ Return both series (for chart) and summary (for cards)
  return {
    series,  // For monthly chart
    summary: {
      avgTemp,     // Seasonal average temperature
      totalRain,   // Total rain over period
      avgHumidity, // Average humidity
      monthly: series
    }
  };
}

// ✅ Main export function
async function fetchWeatherForCrop(cropData) {
  try {
    // Validate crop data
    if (!cropData?.location?.lat || !cropData?.location?.lng) {
      console.warn('⚠️ [Weather] No coordinates provided');
      return {
        series: [],
        summary: { avgTemp: 28, totalRain: 120, avgHumidity: 60 }
      };
    }

    if (!cropData?.timeSeries || cropData.timeSeries.length === 0) {
      console.warn('⚠️ [Weather] No time series data');
      return {
        series: [],
        summary: { avgTemp: 28, totalRain: 120, avgHumidity: 60 }
      };
    }

    const lat = cropData.location?.lat ?? 30.9;
    const lng = cropData.location?.lng ?? 75.8;
    const label = cropData.location?.label ?? '';

    // Get date range from timeSeries
    const dates = cropData.timeSeries
      .map(p => new Date(p.date))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b);

    if (dates.length === 0) {
      console.warn('⚠️ [Weather] Invalid date range');
      return {
        series: [],
        summary: { avgTemp: 28, totalRain: 120, avgHumidity: 60 }
      };
    }

    const start = dates[0];
    const end = dates[dates.length - 1];

    console.log(`🌐 [Weather] Building monthly for lat=${lat}, lng=${lng}, region=${label}`);

    // ✅ Build and return seasonal weather
    return await buildMonthlyWeather(lat, lng, start, end, label);

  } catch (error) {
    console.error('❌ [Weather] Error:', error.message);
    return {
      series: [],
      summary: { avgTemp: 28, totalRain: 120, avgHumidity: 60 }
    };
  }
}

module.exports = { fetchWeatherForCrop };
