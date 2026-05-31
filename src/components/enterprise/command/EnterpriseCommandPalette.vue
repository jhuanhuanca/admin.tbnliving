<template>
  <div v-if="ui.commandPaletteOpen" class="fixed inset-0 z-[60] grid place-items-start bg-black/60 px-4 pt-24">
    <div class="w-full max-w-[760px] overflow-hidden rounded-2xl border border-border bg-panel shadow-soft">
      <div class="flex items-center gap-3 border-b border-border px-4 py-3">
        <IconSvg name="search" />
        <input
          v-model="q"
          class="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
          placeholder="Buscar módulos, páginas, acciones…"
          autofocus
        />
        <span class="badge badge-info">ESC</span>
      </div>

      <div class="max-h-[420px] overflow-auto">
        <div v-if="!filtered.length" class="p-5 text-sm text-text-muted">Sin resultados.</div>
        <button
          v-for="item in filtered"
          :key="item.key"
          class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-white/5"
          @click="run(item)"
        >
          <div class="min-w-0">
            <p class="truncate font-semibold text-text">{{ item.label }}</p>
            <p v-if="item.hint" class="truncate text-xs text-text-muted">{{ item.hint }}</p>
          </div>
          <span class="badge badge-warn">{{ item.group }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { usePermissionsStore } from '@/stores/permissionsStore'
import IconSvg from '@/components/enterprise/icons/IconSvg.vue'

const ui = useUiStore()
const router = useRouter()
const notifs = useNotificationsStore()
const perms = usePermissionsStore()

const q = ref('')

watch(
  () => ui.commandPaletteOpen,
  (open) => {
    if (open) q.value = ''
  },
)

const actions = computed(() => {
  const base = [
    { key: 'go-dashboard', group: 'Go', label: 'Dashboard', hint: '/admin/dashboard', run: () => router.push('/admin/dashboard') },
    { key: 'go-users', group: 'Go', label: 'Usuarios', hint: '/admin/users', run: () => router.push('/admin/users'), can: () => perms.can('users.view') },
    { key: 'go-orders', group: 'Go', label: 'Órdenes', hint: '/admin/orders', run: () => router.push('/admin/orders'), can: () => perms.can('orders.view') },
    { key: 'go-comm', group: 'Go', label: 'Comisiones', hint: '/admin/commissions', run: () => router.push('/admin/commissions'), can: () => perms.can('commissions.view') },
    {
      key: 'go-withdrawals',
      group: 'Go',
      label: 'Retiros',
      hint: '/admin/withdrawals',
      run: () => router.push('/admin/withdrawals'),
      can: () => perms.can('withdrawals.view') || perms.can('withdrawals.approve'),
    },
    {
      key: 'go-support-tickets',
      group: 'Go',
      label: 'Tickets soporte',
      hint: '/admin/support-tickets',
      run: () => router.push('/admin/support-tickets'),
      can: () => perms.can('support.tickets') || perms.isSuperAdmin,
    },
    { key: 'toggle-theme', group: 'UI', label: 'Cambiar tema', hint: 'Dark/Light', run: () => ui.toggleTheme() },
    { key: 'open-notifs', group: 'UI', label: 'Abrir notificaciones', hint: 'Centro de notificaciones', run: () => (notifs.seedMock(), notifs.open = true) },
  ]
  return base.filter((a) => (typeof a.can === 'function' ? a.can() : true))
})

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return actions.value
  return actions.value.filter((a) => `${a.label} ${a.hint || ''} ${a.group}`.toLowerCase().includes(term))
})

function run(item) {
  ui.closeCommandPalette()
  item.run?.()
}
</script>

