export const commissionsRoutes = [
  {
    path: 'commissions',
    name: 'admin.commissions',
    component: () => import('./pages/CommissionsPage.vue'),
    meta: { nav: { section: 'Finanzas', label: 'Comisiones', icon: 'coins' } },
  },
]

