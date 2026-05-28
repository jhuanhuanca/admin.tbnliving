import { ensureCsrfCookie } from './sanctum'
import { http } from './httpClient'

export const authApi = {
  async login({ email, password, device_name = 'panel' }) {
    await ensureCsrfCookie()
    return (await http.post('/api/v1/admin/auth/login', { email, password, device_name })).data
  },
  async me() {
    return (await http.get('/api/v1/admin/auth/me')).data
  },
  async logout() {
    await ensureCsrfCookie()
    return (await http.post('/api/v1/admin/auth/logout')).data
  },
}
