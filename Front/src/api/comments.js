import { api } from './client.js'

export const listComments = (videoId) => api.get(`/videos/${videoId}/comments`)
export const createComment = (videoId, content) =>
  api.post(`/videos/${videoId}/comments`, { content })
export const getComments = listComments