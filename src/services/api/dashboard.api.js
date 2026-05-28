import { http } from './httpClient'

export const dashboardApi = {
  async fetchKpis(params = {}) {
    return (await http.get('/api/v1/admin/dashboard/kpis', { params })).data
  },
}

