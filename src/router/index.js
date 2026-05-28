import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import EnterpriseLayout from '@/components/enterprise/EnterpriseLayout.vue'

import { dashboardRoutes } from '@/modules/dashboard/routes'
import { usersRoutes } from '@/modules/users/routes'
import { affiliationsRoutes } from '@/modules/affiliations/routes'
import { ordersRoutes } from '@/modules/orders/routes'
import { commissionsRoutes } from '@/modules/commissions/routes'
import { analyticsRoutes } from '@/modules/analytics/routes'

const routes = [
  { path: '/', redirect: '/admin/dashboard' },
  { path: '/login', redirect: '/auth/login' },

  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { public: true },
  },

  {
    path: '/admin',
    component: EnterpriseLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      ...dashboardRoutes,
      ...usersRoutes,
      ...affiliationsRoutes,
      ...ordersRoutes,
      ...commissionsRoutes,
      ...analyticsRoutes,
      { path: 'wallet', name: 'admin.wallet', component: () => import('@/views/admin/Wallet.vue') },
      { path: 'withdrawals', name: 'admin.withdrawals', component: () => import('@/views/admin/Withdrawals.vue') },
      { path: 'products', name: 'admin.products', component: () => import('@/views/admin/Products.vue') },
      { path: 'packages', name: 'admin.packages', component: () => import('@/views/admin/Packages.vue') },
      { path: 'reports', name: 'admin.reports', component: () => import('@/views/admin/Reports.vue') },
      {
        path: 'settings',
        name: 'admin.settings',
        component: () => import('@/views/admin/Settings.vue'),
        meta: { roles: ['Super Admin'] },
      },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/admin/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  await auth.bootstrap()

  const isPublic = to.meta.public === true

  if (to.meta.requiresAuth && !auth.isAuthed) {
    return next({ path: '/auth/login', query: { redirect: to.fullPath } })
  }

  if (isPublic && auth.isAuthed) {
    return next('/admin/dashboard')
  }

  next()
})

export default router
