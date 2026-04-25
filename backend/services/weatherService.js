// // const fetch = require('node-fetch');

// // const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

// // const REGIONAL_CLIMATE = {
// //   punjab:      { rain:[15,12,18,8,6,4,80,90,30,10,5,10], temp:[14,17,22,28,33,37,32,30,28,23,18,15] },
// //   kerala:      { rain:[30,25,40,90,300,650,700,500,300,250,180,50], temp:[27,28,29,30,29,28,27,27,27,28,28,28] },
// //   maharashtra: { rain:[5,4,4,8,20,100,300,250,150,30,10,5], temp:[23,25,28,32,35,30,26,26,26,28,26,24] },
// //   default:     { rain:[30,25,30,25,30,60,120,100,80,50,30,20], temp:[22,24,27,30,32,30,28,28,27,26,24,22] }
// // };

// // function getRegionKey(label = '') {
// //   const l = label.toLowerCase();
// //   if (l.includes('punjab') || l.includes('haryana')) return 'punjab';
// //   if (l.includes('kerala')) return 'kerala';
// //   if (l.includes('maharashtra')) return 'maharashtra';
// //   return 'default';
// // }

// // async function buildMonthlyWeather(lat, lng, startDate, endDate, locationLabel) {
// //   const apiKey = process.env.OPENWEATHER_API_KEY;

// //   let currentTemp = null;
// //   let currentHumidity = null;

// //   if (apiKey && apiKey !== 'your_openweathermap_api_key_here') {
// //     try {
// //       const url = `${OWM_BASE}/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
// //       const res = await fetch(url);

// //       if (res.ok) {
// //         const data = await res.json();
// //         currentTemp = data.main?.temp ?? null;
// //         currentHumidity = data.main?.humidity ?? null;
// //       }
// //     } catch (err) {
// //       console.warn("⚠️ Weather API failed, using fallback");
// //     }
// //   }

// //   const start = new Date(startDate);
// //   const end = new Date(endDate);
// //   const region = REGIONAL_CLIMATE[getRegionKey(locationLabel)] || REGIONAL_CLIMATE.default;

// //   const series = [];
// //   const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

// //   while (cursor <= end) {
// //     const monthIdx = cursor.getMonth();

// //     const temp = currentTemp !== null && series.length === 0
// //       ? currentTemp
// //       : region.temp[monthIdx] + (Math.random() * 2 - 1);

// //     const rain = region.rain[monthIdx] * (0.85 + Math.random() * 0.3);

// //     const humidity = currentHumidity !== null && series.length === 0
// //       ? currentHumidity
// //       : 55 + Math.random() * 30;

// //     series.push({
// //       month: cursor.toLocaleString('en-IN', { month: 'short' }),
// //       avgTemp: +temp.toFixed(1),
// //       totalRain: +rain.toFixed(1),
// //       humidity: Math.round(humidity)
// //     });

// //     cursor.setMonth(cursor.getMonth() + 1);
// //   }

// //   // ✅ IMPORTANT: match frontend structure
// //   const temp = series.length
// //     ? Math.round(series.reduce((s, m) => s + m.avgTemp, 0) / series.length)
// //     : null;

// //   const rain = series.reduce((s, m) => s + m.totalRain, 0);

// //   const humidity = series.length
// //     ? Math.round(series.reduce((s, m) => s + m.humidity, 0) / series.length)
// //     : null;

// //   return {
// //     series,
// //     summary: {
// //       temp,
// //       rain,
// //       humidity,
// //       monthly: series
// //     }
// //   };
// // }

// // async function fetchWeatherForCrop(cropData) {
// //   const lat = cropData.location?.lat ?? 30.9;
// //   const lng = cropData.location?.lng ?? 75.8;
// //   const label = cropData.location?.label ?? '';

// //   const dates = cropData.timeSeries.map(p => new Date(p.date)).sort((a, b) => a - b);
// //   const start = dates[0] || new Date();
// //   const end = dates[dates.length - 1] || new Date();

// //   return buildMonthlyWeather(lat, lng, start, end, label);
// // }

// // module.exports = { fetchWeatherForCrop };
// // -------------------------------------------------------------------------------------------------

// const axios = require('axios');

// // ================= CONFIG =================
// const API_KEY = process.env.OPENWEATHER_API_KEY;
// const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// // ================= FALLBACK DATA =================
// // Used when API key is missing or API fails
// const FALLBACK_DATA = {
//   default: {
//     avgTemp: 28,
//     totalRain: 120,
//     avgHumidity: 60,
//     source: 'fallback'
//   },
//   punjab: {
//     avgTemp: 25,
//     totalRain: 80,
//     avgHumidity: 55,
//     source: 'fallback'
//   },
//   kerala: {
//     avgTemp: 27,
//     totalRain: 220,
//     avgHumidity: 80,
//     source: 'fallback'
//   },
//   maharashtra: {
//     avgTemp: 30,
//     totalRain: 140,
//     avgHumidity: 50,
//     source: 'fallback'
//   }
// };

// // ================= HELPER =================
// const getRegionFallback = (label = '') => {
//   const l = label.toLowerCase();

//   if (l.includes('punjab')) return FALLBACK_DATA.punjab;
//   if (l.includes('kerala')) return FALLBACK_DATA.kerala;
//   if (l.includes('maharashtra')) return FALLBACK_DATA.maharashtra;

//   return FALLBACK_DATA.default;
// };

// // ================= MAIN FUNCTION =================
// const fetchWeatherForCrop = async (cropData) => {
//   try {
//     // ================= VALIDATION =================
//     if (!cropData?.location?.lat || !cropData?.location?.lng) {
//       console.warn('No coordinates → using fallback');
//       return { summary: getRegionFallback(cropData?.location?.label) };
//     }

//     // ================= API KEY CHECK =================
//     if (!API_KEY) {
//       console.warn('No API key → using fallback');
//       return { summary: getRegionFallback(cropData.location.label) };
//     }

//     const { lat, lng } = cropData.location;

//     // ================= API CALL =================
//     const response = await axios.get(BASE_URL, {
//       params: {
//         lat,
//         lon: lng,
//         appid: API_KEY,
//         units: 'metric'
//       }
//     });

//     const data = response.data;

//     // ================= FORMAT DATA =================
//     const summary = {
//       avgTemp: data.main.temp,
//       totalRain: data.rain?.['1h'] || 0,
//       avgHumidity: data.main.humidity,
//       condition: data.weather?.[0]?.description || 'clear',
//       source: 'openweather'
//     };

//     return { summary };

//   } catch (error) {
//     console.warn('Weather API failed → fallback:', error.message);

//     return {
//       summary: getRegionFallback(cropData?.location?.label)
//     };
//   }
// };

// module.exports = { fetchWeatherForCrop };
// -----------------------------------------------------------------------------------------------
const axios = require('axios');

// ================= CONFIG =================
const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
// ✅ Request timeout (5 seconds) - prevents hanging on slow servers
const REQUEST_TIMEOUT = 5000;

// ================= FALLBACK DATA =================
// Used when API key is missing or API fails
const FALLBACK_DATA = {
  default: {
    avgTemp: 28,
    totalRain: 120,
    avgHumidity: 60,
    condition: 'partly cloudy',
    source: 'fallback'
  },
  punjab: {
    avgTemp: 25,
    totalRain: 80,
    avgHumidity: 55,
    condition: 'clear',
    source: 'fallback'
  },
  kerala: {
    avgTemp: 27,
    totalRain: 220,
    avgHumidity: 80,
    condition: 'rainy',
    source: 'fallback'
  },
  maharashtra: {
    avgTemp: 30,
    totalRain: 140,
    avgHumidity: 50,
    condition: 'clear',
    source: 'fallback'
  }
};

// ================= HELPER =================
const getRegionFallback = (label = '') => {
  const l = label.toLowerCase();

  if (l.includes('punjab')) return FALLBACK_DATA.punjab;
  if (l.includes('kerala')) return FALLBACK_DATA.kerala;
  if (l.includes('maharashtra')) return FALLBACK_DATA.maharashtra;

  return FALLBACK_DATA.default;
};

// ================= MAIN FUNCTION =================
const fetchWeatherForCrop = async (cropData) => {
  try {
    // ================= VALIDATION =================
    if (!cropData?.location?.lat || !cropData?.location?.lng) {
      console.warn('⚠️ [Weather] No coordinates provided → using fallback');
      return { 
        summary: getRegionFallback(cropData?.location?.label),
        source: 'fallback-no-coords'
      };
    }

    // ================= API KEY CHECK =================
    // ✅ Also check if it's the placeholder value
    if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
      console.warn('⚠️ [Weather] No valid API key → using fallback');
      return { 
        summary: getRegionFallback(cropData.location.label),
        source: 'fallback-no-api-key'
      };
    }

    const { lat, lng } = cropData.location;

    // ================= API CALL WITH TIMEOUT =================
    console.log(`🌐 [Weather] Fetching for lat=${lat}, lng=${lng}`);
    
    const response = await axios.get(BASE_URL, {
      params: {
        lat,
        lon: lng,
        appid: API_KEY,
        units: 'metric'
      },
      timeout: REQUEST_TIMEOUT,  // ✅ Prevent hanging requests
      headers: {
        'User-Agent': 'CropCycle-App/1.0'  // ✅ Some servers require this
      }
    });

    const data = response.data;

    // ================= FORMAT DATA =================
    const summary = {
      avgTemp: Math.round(data.main?.temp || 25),
      totalRain: data.rain?.['1h'] || 0,
      avgHumidity: data.main?.humidity || 60,
      condition: data.weather?.[0]?.description || 'clear sky',
      source: 'openweather'
    };

    console.log(`✅ [Weather] Successfully fetched:`, summary);
    return { summary };

  } catch (error) {
    // ================= ENHANCED ERROR DETECTION =================
    const errorType = error.code === 'ECONNABORTED' 
      ? 'timeout' 
      : error.response?.status === 401 
      ? 'invalid-api-key'
      : error.response?.status === 404
      ? 'location-not-found'
      : error.message;

    console.warn(`⚠️ [Weather] API error (${errorType}): ${error.message}`);

    // Return fallback data on any error
    return {
      summary: getRegionFallback(cropData?.location?.label),
      source: `fallback-${errorType}`,
      originalError: error.message
    };
  }
};

module.exports = { fetchWeatherForCrop };
