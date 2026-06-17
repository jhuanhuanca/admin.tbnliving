import axios from 'axios'
import { ensureCsrfCookie, resetCsrfCookie } from './sanctum'

/** API core Synkai: producción en api.tbnliving.com */
const defaultApiBase = import.meta.env.DEV ? '' : 'https://api.tbnliving.com'

/** En producción: cookies Sanctum + CSRF. En dev: proxy Vite (mismo origen). */
const useCredentials =
  import.meta.env.VITE_API_WITH_CREDENTIALS === 'true' ||
  (import.meta.env.PROD && import.meta.env.VITE_API_WITH_CREDENTIALS !== 'false')

export const http = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL ?? defaultApiBase,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
  withCredentials: useCredentials,
  withXSRFToken: useCredentials,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
})

export const LS_TOKEN_KEY = 'mlm_admin_token'
export const LS_AUTH_KEY = 'mlm_admin_auth'

http.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(method)
  const token = localStorage.getItem(LS_TOKEN_KEY)

  if (token) {
    config.headers = config.headers || {}
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  // CSRF solo si no hay Bearer (login/registro público).
  if (needsCsrf && config.withCredentials && !token) {
    await ensureCsrfCookie()
  }

  // FormData: el navegador debe fijar multipart/form-data con boundary.
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData
  if (isFormData) {
    const headers = config.headers
    if (headers?.setContentType) {
      headers.setContentType(false)
    } else if (headers) {
      delete headers['Content-Type']
      delete headers['content-type']
    }
    // Reafirmar Bearer tras tocar headers (axios 1.x puede perderlo con FormData).
    if (token && typeof headers?.set === 'function') {
      headers.set('Authorization', `Bearer ${token}`)
    }
  } else if (
    config.data != null
    && typeof config.data === 'object'
    && !(config.data instanceof Blob)
    && !Array.isArray(config.data)
  ) {
    config.headers = config.headers || {}
    if (!config.headers['Content-Type'] && !config.headers['content-type']) {
      config.headers['Content-Type'] = 'application/json'
    }
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const config = error.config

    if (status === 419 && config && !config.__csrfRetried && !localStorage.getItem(LS_TOKEN_KEY)) {
      resetCsrfCookie()
      await ensureCsrfCookie()
      config.__csrfRetried = true
      return http.request(config)
    }

    return Promise.reject(error)
  },
)
