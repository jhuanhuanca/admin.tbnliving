
export default [
  { path: '/admin/dashboard', component: () => import('@/views/admin/Dashboard.vue') },
  { path: '/admin/users', component: () => import('@/views/admin/Users.vue') },
  { path: '/admin/tree', component: () => import('@/views/admin/BinaryTree.vue') },
]