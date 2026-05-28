import axios from 'axios'
import { http } from './httpClient'

let csrfPromise = null

/**
 * Obtiene la cookie XSRF-TOKEN (dominio .tbnliving.com) antes de POST/PUT/DELETE.
 * Requerido por Sanctum SPA cross-subdomain.
 */
export async function ensureCsrfCookie() {
  if (!http.defaults.withCredentials) {
    return
  }

  if (!csrfPromise) {
    const baseURL = http.defaults.baseURL || ''
    csrfPromise = axios
      .get('/sanctum/csrf-cookie', {
        baseURL,
        withCredentials: true,
        headers: { Accept: 'application/json' },
        timeout: 15000,
      })
      .finally(() => {
        csrfPromise = null
      })
  }

  return csrfPromise
}

export function resetCsrfCookie() {
  csrfPromise = null
}
