<template>
  <header class="sticky top-0 z-40 border-b border-border bg-nav/95">
    <div class="flex h-16 items-center justify-between gap-4 px-6">
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-white">{{ pageTitle }}</p>
        <p class="truncate text-xs text-white/70">{{ pageSubtitle }}</p>
      </div>

      <div class="flex items-center gap-2">
        <button class="btn btn-ghost text-white hover:bg-white/10" @click="ui.toggleTheme()">
          <span class="text-xs">{{ ui.isDark ? 'Dark' : 'Light' }}</span>
        </button>

        <button class="btn btn-ghost text-white hover:bg-white/10" @click="mockNotify()">
          <span class="text-sm">Notificaciones</span>
          <span class="badge badge-warn">3</span>
        </button>

        <div class="relative">
          <button class="btn btn-ghost text-white hover:bg-white/10" @click="open = !open">
            <span class="h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/20" />
            <span class="hidden text-sm sm:block">{{ auth.user?.name ?? 'Usuario' }}</span>
          </button>

          <div
            v-if="open"
            class="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-panel shadow-soft"
          >
            <div class="p-4">
              <p class="text-sm font-semibold text-text">{{ auth.user?.name }}</p>
              <p class="text-xs text-text-muted">{{ auth.user?.email }}</p>
              <p class="mt-2 text-xs">
                <span class="badge badge-info">{{ auth.role }}</span>
              </p>
            </div>
            <div class="border-t border-border p-2">
              <button class="btn btn-ghost w-full justify-start" @click="logout()">Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const open = ref(false)

const pageTitle = computed(() => {
  const map = {
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Usuarios',
    'admin.tree': 'Árbol Binario',
    'admin.commissions': 'Comisiones',
    'admin.wallet': 'Wallet',
    'admin.withdrawals': 'Retiros',
    'admin.orders': 'Órdenes',
    'admin.products': 'Productos',
    'admin.reports': 'Reportes',
    'admin.settings': 'Configuración MLM',
  }
  return map[route.name] ?? 'Admin'
})

const pageSubtitle = computed(() => {
  const map = {
    'admin.dashboard': 'KPIs, gráficos y actividad reciente',
    'admin.users': 'Búsqueda, filtros, paginación y perfil',
    'admin.tree': 'Visualización avanzada de red binaria',
  }
  return map[route.name] ?? 'Backoffice empresarial'
})

function mockNotify() {
  ui.toast({ type: 'info', title: 'Notificación', message: 'Sistema en modo mock. API lista para Laravel.' })
}

async function logout() {
  open.value = false
  auth.logout()
  await router.push('/auth/login')
}

function onDocClick(e) {
  const target = e.target
  if (!(target instanceof HTMLElement)) return
  if (target.closest('header') == null) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

