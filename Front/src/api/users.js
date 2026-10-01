import { api } from './client.js'

export const registerUser = (payload) =>
  api.post('/users', payload, { auth: false })

export const loginUser = (payload) =>
  api.post('/login', payload, { auth: false })

export const getUser = (id) => api.get(`/users/${id}`)
export const getMe = () => api.get('/me')