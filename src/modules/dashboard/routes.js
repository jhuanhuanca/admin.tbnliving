export const dashboardRoutes = [
  {
    path: 'dashboard',
    name: 'admin.dashboard',
    component: () => import('./pages/DashboardPage.vue'),
    meta: { nav: { section: 'Dashboard', label: 'Dashboard', icon: 'grid' } },
  },
]

