<template>
  <header class="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
    <div class="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <button class="btn btn-ghost lg:hidden" @click="ui.openMobileDrawer()">
          <span class="text-sm">☰</span>
        </button>

        <div class="min-w-0">
          <nav class="flex items-center gap-2 text-xs text-text-muted">
            <span v-for="(c, idx) in crumbs" :key="c.path" class="inline-flex items-center gap-2">
              <RouterLink v-if="idx < crumbs.length - 1" :to="c.path" class="hover:text-text">{{ c.label }}</RouterLink>
              <span v-else class="text-text">{{ c.label }}</span>
              <span v-if="idx < crumbs.length - 1" class="text-text-muted">/</span>
            </span>
          </nav>
          <p class="truncate text-sm font-semibold text-text">{{ title }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button class="btn btn-ghost hidden sm:flex" @click="ui.toggleCommandPalette()">
          <IconSvg name="search" />
          <span class="text-sm">Buscar</span>
          <span class="badge badge-info">Ctrl K</span>
        </button>

        <button class="btn btn-ghost" @click="quick.seeded = true">
          <IconSvg name="bolt" />
          <span class="hidden sm:inline text-sm">Quick</span>
        </button>

        <div class="relative">
          <button class="btn btn-ghost" @click="toggleNotifications()">
            <IconSvg name="bell" />
            <span v-if="notifs.unread" class="badge badge-warn">{{ notifs.unread }}</span>
          </button>
          <div
            v-if="notifs.open"
            class="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-panel shadow-soft"
          >
            <div class="flex items-center justify-between border-b border-border p-3">
              <p class="text-sm font-semibold text-text">Notificaciones</p>
              <button class="btn btn-ghost btn-sm" @click="notifs.markAllRead()">Marcar leído</button>
            </div>
            <div class="max-h-[380px] overflow-auto">
              <div v-if="!notifs.items.length" class="p-4 text-sm text-text-muted">Sin notificaciones.</div>
              <div v-for="n in notifs.items" :key="n.id" class="border-b border-border p-4">
                <p class="text-sm font-semibold text-text">{{ n.title }}</p>
                <p class="mt-1 text-sm text-text-muted">{{ n.body }}</p>
                <p class="mt-2 text-xs text-text-muted">{{ formatTs(n.ts) }}</p>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-ghost" @click="ui.toggleTheme()">
          <span class="text-xs">{{ ui.isDark ? 'Dark' : 'Light' }}</span>
        </button>

        <div class="relative">
          <button class="btn btn-ghost" @click="menuOpen = !menuOpen">
            <span class="h-8 w-8 rounded-full bg-white/10 ring-1 ring-white/20" />
            <span class="hidden text-sm sm:block">{{ auth.user?.name ?? 'Admin' }}</span>
          </button>
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-panel shadow-soft"
          >
            <div class="p-4">
              <p class="text-sm font-semibold text-text">{{ auth.user?.name }} {{ auth.user?.lastname }}</p>
              <p class="text-xs text-text-muted">{{ auth.user?.email }}</p>
              <div class="mt-2 flex flex-wrap gap-1">
                <span v-for="r in perms.roles" :key="r" class="badge badge-info">{{ r }}</span>
              </div>
            </div>
            <div class="border-t border-border p-2">
              <button class="btn btn-ghost w-full justify-start" @click="logout">Cerrar sesión</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { usePermissionsStore } from '@/stores/permissionsStore'
import IconSvg from '@/components/enterprise/icons/IconSvg.vue'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()
const notifs = useNotificationsStore()
const perms = usePermissionsStore()

const menuOpen = ref(false)
const quick = reactive({ seeded: false })

const title = computed(() => {
  const n = route?.name ? String(route.name) : ''
  const map = {
    'admin.dashboard': 'Dashboard',
    'admin.users': 'Usuarios',
    'admin.tree': 'Árbol MLM',
    'admin.orders': 'Órdenes',
    'admin.commissions': 'Comisiones',
    'admin.withdrawals': 'Retiros',
    'admin.wallet': 'Wallet',
    'admin.products': 'Productos',
    'admin.packages': 'Paquetes',
    'admin.reports': 'Reportes',
    'admin.settings': 'Configuraciones',
  }
  return map[n] || 'Admin'
})

const crumbs = computed(() => {
  const seg = String(route.path || '').split('/').filter(Boolean)
  const out = [{ label: 'Admin', path: '/admin/dashboard' }]
  if (seg[0] === 'admin' && seg[1]) {
    out.push({ label: title.value, path: route.path })
  }
  return out
})

function toggleNotifications() {
  notifs.seedMock()
  notifs.toggle()
}

function formatTs(ts) {
  try {
    return new Date(ts).toLocaleString('es-BO')
  } catch {
    return ts
  }
}

async function logout() {
  menuOpen.value = false
  auth.logout()
  await router.push('/auth/login')
}

function onDocClick(e) {
  const t = e.target
  if (!(t instanceof HTMLElement)) return
  if (t.closest('header') == null) {
    menuOpen.value = false
    notifs.close()
  }
}

function onKeydown(e) {
  if (!(e instanceof KeyboardEvent)) return
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    ui.toggleCommandPalette()
  }
  if (e.key === 'Escape') {
    ui.closeCommandPalette()
    notifs.close()
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

