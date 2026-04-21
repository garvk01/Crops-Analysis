import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill all fields'); return }
    setLoading(true); setError('')
    try {
      await login(email, password)
      toast.success('Welcome back! 🌱')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logoBox}>
            <svg viewBox="0 0 24 24" fill="white" width={28} height={28}>
              <path d="M17 8C8 10 5.9 16.17 3.82 22H5C5.5 20.5 7 17 12 15c3.71-.78 6.02-3.5 7.06-7L17 8zM5.5 6.5C4.67 5.87 4 5 4 4a4 4 0 018 0c0 1-.67 1.87-1.5 2.5C9.5 7.87 9 9 9 10H7c0-1-.5-2.13-1.5-3.5z"/>
            </svg>
          </div>
          <h1 className={styles.title}>CropCycle</h1>
          <p className={styles.sub}>Sign in to your account</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input className={styles.input} type="email" placeholder="you@agri.in" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input className={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <p className={styles.switch}>
          No account? <span onClick={() => navigate('/register')}>Create one</span>
        </p>
      </div>
    </div>
  )
}
