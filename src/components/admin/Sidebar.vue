<template>
  <aside class="hidden w-72 shrink-0 border-r border-border bg-nav lg:block">
    <div class="flex h-16 items-center gap-3 px-6">
      <div class="h-9 w-9 rounded-xl bg-brand/20 ring-1 ring-brand/30" />
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-white">MLM Admin</p>
        <p class="truncate text-xs text-white/70">Enterprise Backoffice</p>
      </div>
    </div>

    <nav class="px-3 py-3">
      <RouterLink
        v-for="item in visibleItems"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        active-class="bg-white/10 text-white ring-1 ring-white/10"
      >
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 group-[.router-link-active]:bg-brand/15 group-[.router-link-active]:ring-brand/30">
          <component :is="item.icon" class="h-4 w-4" />
        </span>
        <span class="truncate">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { usePermissionsStore } from '@/stores/permissionsStore'

const perms = usePermissionsStore()

const IconGrid = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" stroke="currentColor" stroke-width="1.5"/></svg>',
}
const IconUsers = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" stroke="currentColor" stroke-width="1.5"/><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
}
const IconTree = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v6m0 4v6M7 10h10M8 20h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6.5 10.5 4 13l2.5 2.5M17.5 10.5 20 13l-2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}
const IconWallet = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v9A3.5 3.5 0 0 1 16.5 20h-9A3.5 3.5 0 0 1 4 16.5v-9Z" stroke="currentColor" stroke-width="1.5"/><path d="M20 10h-5a2 2 0 0 0 0 4h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
}
const IconMoney = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16v10H4V7Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 12h.01M16 12h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" stroke="currentColor" stroke-width="1.5"/></svg>',
}
const IconBox = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M4 7l8 4 8-4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
}
const IconReceipt = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
}
const IconChart = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M4 19V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M4 19h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M7 15l4-4 3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}
const IconSettings = {
  template:
    '<svg viewBox="0 0 24 24" fill="none" class="text-white" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 15a8 8 0 0 0 .1-2l2-1.2-2-3.4-2.3.7a8 8 0 0 0-1.7-1L15 5h-6l-.5 3.1a8 8 0 0 0-1.7 1l-2.3-.7-2 3.4 2 1.2a8 8 0 0 0 .1 2l-2 1.2 2 3.4 2.3-.7a8 8 0 0 0 1.7 1L9 19h6l.5-3.1a8 8 0 0 0 1.7-1l2.3.7 2-3.4-2-1.2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
}

const items = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: IconGrid },
  { label: 'Usuarios', to: '/admin/users', icon: IconUsers },
  { label: 'Árbol Binario', to: '/admin/tree', icon: IconTree },
  { label: 'Comisiones', to: '/admin/commissions', icon: IconMoney },
  { label: 'Wallet', to: '/admin/wallet', icon: IconWallet },
  { label: 'Retiros', to: '/admin/withdrawals', icon: IconMoney },
  { label: 'Órdenes', to: '/admin/orders', icon: IconReceipt },
  { label: 'Productos', to: '/admin/products', icon: IconBox },
  { label: 'Paquetes', to: '/admin/packages', icon: IconBox },
  { label: 'Reportes', to: '/admin/reports', icon: IconChart },
  { label: 'Configuración', to: '/admin/settings', icon: IconSettings, roles: ['Super Admin'] },
]

const visibleItems = computed(() => items.filter((i) => (!i.roles ? true : i.roles.some((r) => perms.hasRole(r)))))
</script>