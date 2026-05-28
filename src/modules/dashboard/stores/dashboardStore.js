import { defineStore } from 'pinia'
import { dashboardApi } from '@/services/api/dashboard.api'

const KPI_KEYS = [
  'users_total',
  'orders_today',
  'orders_revenue_total',
  'commissions_paid_total',
  'withdrawals_pending',
  'users_new_this_month',
  'binary_volume_current_period',
  'sales_daily_total',
  'active_users',
  'active_members',
]

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    loading: false,
    error: null,
    kpis: [],
    stats: null,
    charts: null,
    topMembers: [],
    lastUpdatedAt: null,
  }),
  getters: {
    hasCharts(state) {
      const c = state.charts
      return Boolean(c && typeof c === 'object' && Object.keys(c).length > 0)
    },
  },
  actions: {
    async fetchKpis(params = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await dashboardApi.fetchKpis(params)
        const payload = res?.success === true && res?.data ? res.data : res

        this.stats = payload && typeof payload === 'object' ? payload : null
        this.charts = payload?.charts ?? null
        this.topMembers = Array.isArray(payload?.top_members) ? payload.top_members : []

        this.kpis = Array.isArray(payload?.items) ? payload.items : []

        if (!this.kpis.length && payload && typeof payload === 'object') {
          if (res?.success === false) {
            this.error = res.message || 'No se pudieron cargar los KPIs.'
          } else if (payload.users_total != null) {
            const asOf = payload.as_of_at || new Date().toISOString()
            this.kpis = KPI_KEYS.filter((key) => payload[key] != null).map((key) => ({
              key,
              value: String(payload[key]),
              as_of_at: asOf,
            }))
          }
        }

        this.lastUpdatedAt = new Date().toISOString()
      } catch (e) {
        const d = e?.response?.data
        this.error =
          d?.message ||
          (d?.code === 'MLM_UNAUTHORIZED'
            ? 'Token MLM incorrecto: revisa INTERNAL_SYNC_TOKEN en el API core.'
            : 'No se pudieron cargar los KPIs.')
        this.stats = null
        this.charts = null
        this.topMembers = []
      } finally {
        this.loading = false
      }
    },
  },
})
