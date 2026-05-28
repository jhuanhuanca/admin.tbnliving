export const usersRoutes = [
  {
    path: 'users',
    name: 'admin.users',
    component: () => import('./pages/UsersPage.vue'),
    meta: { nav: { section: 'Usuarios', label: 'Usuarios', icon: 'users' } },
  },
]

