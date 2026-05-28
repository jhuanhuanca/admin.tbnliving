export const affiliationsRoutes = [
  {
    path: 'tree',
    name: 'admin.tree',
    component: () => import('./pages/BinaryTreePage.vue'),
    meta: { nav: { section: 'Afiliaciones', label: 'Árbol MLM', icon: 'tree' } },
  },
]

