export const ordersRoutes = [
  {
    path: 'orders',
    name: 'admin.orders',
    component: () => import('./pages/OrdersPage.vue'),
    meta: { nav: { section: 'Ventas', label: 'Órdenes', icon: 'receipt' } },
  },
]

