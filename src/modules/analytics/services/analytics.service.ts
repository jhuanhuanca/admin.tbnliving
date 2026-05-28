import { http } from '@/services/api/httpClient'

export type DateRangeParams = {
  from?: string
  to?: string
  country_code?: string
  product_id?: number
  limit?: number
}

export const analyticsService = {
  getOverview(params: DateRangeParams = {}) {
    return http.get('/api/v1/analytics/overview', { params }).then((r) => r.data)
  },
  getSalesMetricsDaily(params: DateRangeParams = {}) {
    return http.get('/api/v1/analytics/sales/daily', { params }).then((r) => r.data)
  },
  getSalesMetricsMonthly(params: DateRangeParams = {}) {
    return http.get('/api/v1/analytics/sales/monthly', { params }).then((r) => r.data)
  },
  getProductMetricsTop(params: DateRangeParams = {}) {
    return http.get('/api/v1/analytics/products/top', { params }).then((r) => r.data)
  },
  getProductMetricsDaily(params: DateRangeParams = {}) {
    return http.get('/api/v1/analytics/products/daily', { params }).then((r) => r.data)
  },
  getGrowthMetrics(params: DateRangeParams = {}) {
    return http.get('/api/v1/analytics/growth/mlm', { params }).then((r) => r.data)
  },
  getCountryMetrics(params: DateRangeParams = {}) {
    return http.get('/api/v1/analytics/countries/metrics', { params }).then((r) => r.data)
  },
  getNetworkGrowth(params: DateRangeParams = {}) {
    return http.get('/api/v1/analytics/network/growth', { params }).then((r) => r.data)
  },
  getCommissionMetrics(params: any = {}) {
    return http.get('/api/v1/analytics/commissions/summary', { params }).then((r) => r.data)
  },
}

