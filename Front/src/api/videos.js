import { api } from './client.js'

export const listVideos = () => api.get('/videos')
export const getVideos = listVideos
export const getVideo = (id) => api.get(`/videos/${id}`)
export const getRecommended = (id) => api.get(`/videos/${id}/recommended`)
export const searchVideos = async (query) => {
  const videos = await listVideos()
  const needle = query.toLocaleLowerCase()
  return videos.filter((video) => `${video.title} ${video.owner?.name || ''}`.toLocaleLowerCase().includes(needle))
}
export const createVideo = (payload) => api.post('/videos', payload)
export const updateVideo = (id, payload) => api.put(`/videos/${id}`, payload)
export const deleteVideo = (id) => api.del(`/videos/${id}`)

export const getUploadUrl = (kind, contentType) =>
  api.post(
    `/videos/upload-url?kind=${encodeURIComponent(kind)}&content_type=${encodeURIComponent(contentType)}`
  )