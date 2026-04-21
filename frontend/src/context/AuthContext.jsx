// import { createContext, useContext, useState, useEffect } from 'react'
// import api from '../utils/api'

// const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null)
//   const [token, setToken] = useState(localStorage.getItem('cc_token'))
//   const [loading, setLoading] = useState(true)

//   // On mount, verify stored token
//   useEffect(() => {
//     const verify = async () => {
//       if (!token) { setLoading(false); return }
//       try {
//         const res = await api.get('/auth/me')
//         setUser(res.data.user)
//       } catch {
//         logout()
//       } finally {
//         setLoading(false)
//       }
//     }
//     verify()
//   }, [])

//   const login = async (email, password) => {
//     const res = await api.post('/auth/login', { email, password })
//     const { token: t, user: u } = res.data
//     localStorage.setItem('cc_token', t)
//     setToken(t)
//     setUser(u)
//     return u
//   }

//   const register = async (name, email, password) => {
//     const res = await api.post('/auth/register', { name, email, password })
//     const { token: t, user: u } = res.data
//     localStorage.setItem('cc_token', t)
//     setToken(t)
//     setUser(u)
//     return u
//   }

//   const logout = () => {
//     localStorage.removeItem('cc_token')
//     setToken(null)
//     setUser(null)
//   }

//   return (
//     <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
//       {!loading && children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)
// ---------------------------------------------------------------------------------------------------
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cc_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verify = async () => {
      if (!token) { setLoading(false); return }
      try {
        // ✅ FIXED
        const res = await api.get('/api/auth/me')
        setUser(res.data.user)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [])

  const login = async (email, password) => {
    // ✅ FIXED
    const res = await api.post('/api/auth/login', { email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('cc_token', t)
    setToken(t)
    setUser(u)
    return u
  }

  const register = async (name, email, password) => {
    // ✅ FIXED
    const res = await api.post('/api/auth/register', { name, email, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('cc_token', t)
    setToken(t)
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('cc_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)