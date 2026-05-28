import { defineStore } from 'pinia'
import { analyticsService, type DateRangeParams } from '../services/analytics.service'

type LoadState = 'idle' | 'loading' | 'error'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    filters: {
      from: null as string | null,
      to: null as string | null,
      country_code: null as string | null,
    },
    overview: null as any,
    salesDaily: [] as any[],
    salesMonthly: [] as any[],
    topProducts: [] as any[],
    networkGrowth: [] as any[],
    countryMetrics: [] as any[],
    growth: [] as any[],
    loading: {
      overview: 'idle' as LoadState,
      sales: 'idle' as LoadState,
      products: 'idle' as LoadState,
      network: 'idle' as LoadState,
      countries: 'idle' as LoadState,
      growth: 'idle' as LoadState,
    },
    error: null as string | null,
    cacheTs: {} as Record<string, number>,
  }),
  actions: {
    setDateRange({ from, to }: { from?: string; to?: string }) {
      this.filters.from = from || null
      this.filters.to = to || null
    },
    setCountry(code: string | null) {
      this.filters.country_code = code
    },
    buildParams(extra: Partial<DateRangeParams> = {}): DateRangeParams {
      return {
        from: this.filters.from || undefined,
        to: this.filters.to || undefined,
        country_code: this.filters.country_code || undefined,
        ...extra,
      }
    },
    isFresh(key: string, ttlMs = 30_000) {
      const ts = this.cacheTs[key] || 0
      return Date.now() - ts < ttlMs
    },
    markFresh(key: string) {
      this.cacheTs[key] = Date.now()
    },

    async fetchOverview(force = false) {
      if (!force && this.isFresh('overview')) return
      this.loading.overview = 'loading'
      this.error = null
      try {
        this.overview = await analyticsService.getOverview(this.buildParams())
        this.markFresh('overview')
        this.loading.overview = 'idle'
      } catch (e: any) {
        this.loading.overview = 'error'
        this.error = e?.response?.data?.message || 'No se pudo cargar Analytics Overview.'
      }
    },

    async fetchSales(force = false) {
      if (!force && this.isFresh('sales')) return
      this.loading.sales = 'loading'
      this.error = null
      try {
        const params = this.buildParams()
        const [d, m] = await Promise.all([
          analyticsService.getSalesMetricsDaily(params),
          analyticsService.getSalesMetricsMonthly(params),
        ])
        this.salesDaily = d.data || []
        this.salesMonthly = m.data || []
        this.markFresh('sales')
        this.loading.sales = 'idle'
      } catch (e: any) {
        this.loading.sales = 'error'
        this.error = e?.response?.data?.message || 'No se pudo cargar Sales Analytics.'
      }
    },

    async fetchProducts(force = false) {
      if (!force && this.isFresh('products')) return
      this.loading.products = 'loading'
      this.error = null
      try {
        const top = await analyticsService.getProductMetricsTop(this.buildParams({ limit: 10 }))
        this.topProducts = top.data || []
        this.markFresh('products')
        this.loading.products = 'idle'
      } catch (e: any) {
        this.loading.products = 'error'
        this.error = e?.response?.data?.message || 'No se pudo cargar Products Analytics.'
      }
    },

    async fetchNetwork(force = false) {
      if (!force && this.isFresh('network')) return
      this.loading.network = 'loading'
      this.error = null
      try {
        const res = await analyticsService.getNetworkGrowth(this.buildParams())
        this.networkGrowth = res.data || []
        this.markFresh('network')
        this.loading.network = 'idle'
      } catch (e: any) {
        this.loading.network = 'error'
        this.error = e?.response?.data?.message || 'No se pudo cargar Network Analytics.'
      }
    },

    async fetchCountries(force = false) {
      if (!force && this.isFresh('countries')) return
      this.loading.countries = 'loading'
      this.error = null
      try {
        const res = await analyticsService.getCountryMetrics(this.buildParams())
        this.countryMetrics = res.data || []
        this.markFresh('countries')
        this.loading.countries = 'idle'
      } catch (e: any) {
        this.loading.countries = 'error'
        this.error = e?.response?.data?.message || 'No se pudo cargar Countries Analytics.'
      }
    },

    async fetchGrowth(force = false) {
      if (!force && this.isFresh('growth')) return
      this.loading.growth = 'loading'
      this.error = null
      try {
        const res = await analyticsService.getGrowthMetrics(this.buildParams())
        this.growth = res.data || []
        this.markFresh('growth')
        this.loading.growth = 'idle'
      } catch (e: any) {
        this.loading.growth = 'error'
        this.error = e?.response?.data?.message || 'No se pudo cargar Growth Analytics.'
      }
    },
  },
})

