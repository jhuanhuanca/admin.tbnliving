import { usePermissionsStore } from '@/stores/permissionsStore'

const icon = (key) => key

export function buildNavSections() {
  // En una fase siguiente esto se puede generar desde módulos + route meta.nav,
  // pero hoy lo definimos explícito para UX enterprise coherente.
  const perms = usePermissionsStore()

  const sections = [
    {
      title: 'Overview',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: icon('grid'), can: () => true },
        { to: '/admin/analytics', label: 'Analytics', icon: icon('chart'), can: () => perms.can('dashboard.view') },
        { to: '/admin/tree', label: 'Árbol MLM', icon: icon('tree'), can: () => true },
        { to: '/admin/users', label: 'Usuarios', icon: icon('users'), can: () => perms.can('users.view') },
      ],
    },
    {
      title: 'Finanzas',
      items: [
        { to: '/admin/orders', label: 'Órdenes', icon: icon('receipt'), can: () => perms.can('orders.view') },
        { to: '/admin/commissions', label: 'Comisiones', icon: icon('coins'), can: () => perms.can('commissions.view') },
        {
          to: '/admin/withdrawals',
          label: 'Retiros',
          icon: icon('bank'),
          can: () => perms.can('withdrawals.view') || perms.can('withdrawals.approve'),
        },
        { to: '/admin/wallet', label: 'Wallet', icon: icon('wallet'), can: () => true },
      ],
    },
    {
      title: 'Catálogo',
      items: [
        { to: '/admin/products', label: 'Productos', icon: icon('box'), can: () => true },
        { to: '/admin/packages', label: 'Paquetes', icon: icon('layers'), can: () => true },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { to: '/admin/reports', label: 'Reportes', icon: icon('chart'), can: () => perms.can('reports.export') },
        {
          to: '/admin/settings',
          label: 'Configuraciones',
          icon: icon('settings'),
          can: () => perms.can('system.manage'),
        },
      ],
    },
  ]

  return sections
    .map((s) => ({ ...s, items: s.items.filter((i) => (typeof i.can === 'function' ? i.can() : true)) }))
    .filter((s) => s.items.length > 0)
}

