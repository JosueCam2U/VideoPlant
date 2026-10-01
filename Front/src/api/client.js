const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const finalHeaders = { ...headers }
  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
  }
  if (auth) {
    const t = getToken()
    if (t) finalHeaders['Authorization'] = `Bearer ${t}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) }
    catch { data = { detail: text } }
  }

  if (!res.ok) {
    const detail = data?.detail || data?.message || `Error ${res.status}`
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
  }
  return data
}

export const api = {
  get: (p, opts) => request(p, { ...opts }),
  post: (p, body, opts) => request(p, { method: 'POST', body, ...opts }),
  put: (p, body, opts) => request(p, { method: 'PUT', body, ...opts }),
  del: (p, opts) => request(p, { method: 'DELETE', ...opts }),
}