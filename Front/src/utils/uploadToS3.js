import { getUploadUrl } from '../api/videos.js'

/**
 * Sube un archivo directo a S3 usando una URL prefirmada del backend.
 * @returns {Promise<string>} URL pública del archivo subido
 */
export async function uploadToS3(file, kind = 'video') {
  const { upload_url, file_url } = await getUploadUrl(kind, file.type)
  const res = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) throw new Error(`Fallo subiendo ${kind} a S3`)
  return file_url
}

export default uploadToS3