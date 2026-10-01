import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser, getMe } from '../api/users.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    await registerUser(payload)
    return login({ email: payload.email, password: payload.password })
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const signIn = useCallback((userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, signIn, signOut: logout, isAuthenticated: !!user }),
    [user, loading, login, register, logout, signIn],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}