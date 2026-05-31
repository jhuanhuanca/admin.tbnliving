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
    csrfPromise = http
      .get('/sanctum/csrf-cookie')
      .finally(() => {
        csrfPromise = null
      })
  }

  return csrfPromise
}

export function resetCsrfCookie() {
  csrfPromise = null
}
