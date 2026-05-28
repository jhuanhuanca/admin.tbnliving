export const analyticsRoutes = [
  {
    path: 'analytics',
    name: 'analytics.overview',
    component: () => import('./pages/AnalyticsOverviewPage.vue'),
    meta: { nav: { section: 'Analytics', label: 'Analytics', icon: 'chart' } },
  },
  {
    path: 'analytics/sales',
    name: 'analytics.sales',
    component: () => import('./pages/SalesAnalyticsPage.vue'),
  },
  {
    path: 'analytics/products',
    name: 'analytics.products',
    component: () => import('./pages/ProductsAnalyticsPage.vue'),
  },
  {
    path: 'analytics/network',
    name: 'analytics.network',
    component: () => import('./pages/NetworkAnalyticsPage.vue'),
  },
  {
    path: 'analytics/commissions',
    name: 'analytics.commissions',
    component: () => import('./pages/CommissionsAnalyticsPage.vue'),
  },
  {
    path: 'analytics/countries',
    name: 'analytics.countries',
    component: () => import('./pages/CountriesAnalyticsPage.vue'),
  },
  {
    path: 'analytics/growth',
    name: 'analytics.growth',
    component: () => import('./pages/GrowthAnalyticsPage.vue'),
  },
]

