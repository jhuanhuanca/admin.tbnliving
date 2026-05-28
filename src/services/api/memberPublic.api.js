import { http } from './httpClient'
import { ensureCsrfCookie } from './sanctum'

/**
 * Registro de socio desde admin u otro SPA en *.tbnliving.com
 * Flujo: GET /sanctum/csrf-cookie → POST /api/register
 */
export const memberPublicApi = {
  async register(payload) {
    await ensureCsrfCookie()
    return (await http.post('/api/register', payload)).data
  },

  async registerPreferredCustomer(payload) {
    await ensureCsrfCookie()
    return (await http.post('/api/register/preferred-customer', payload)).data
  },

  async resendVerification(email) {
    await ensureCsrfCookie()
    return (await http.post('/api/email/resend-verification', { email })).data
  },
}
