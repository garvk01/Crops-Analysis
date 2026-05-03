import axios from 'axios'

const base = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '')

const api = axios.create({
  baseURL: `${base}/api`,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api