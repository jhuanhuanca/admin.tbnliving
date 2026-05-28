<template>
  <div class="min-h-screen bg-bg px-6 py-10">
    <div class="mx-auto flex w-full max-w-[1080px] items-stretch gap-8">
      <div class="hidden flex-1 lg:block">
        <div class="card h-full p-8">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-xl bg-brand/20 ring-1 ring-brand/30" />
            <div>
              <p class="text-sm font-semibold text-text">MLM Enterprise</p>
              <p class="text-sm text-text-muted">Backoffice Admin Panel</p>
            </div>
          </div>
          <div class="mt-10 space-y-4">
            <p class="text-3xl font-semibold leading-tight text-text">
              Admin fintech tipo Binance,
              <span class="text-brand">listo para producción</span>.
            </p>
            <p class="max-w-[48ch] text-sm text-text-muted">
              UI dark premium, módulos MLM y arquitectura preparada para conectar con Laravel (axios + servicios).
            </p>
          </div>
          <div class="mt-10 grid grid-cols-2 gap-4">
            <div class="card p-4">
              <p class="text-xs font-semibold text-text">KPIs + Charts</p>
              <p class="mt-1 text-xs text-text-muted">Ingresos, comisiones, volumen binario.</p>
            </div>
            <div class="card p-4">
              <p class="text-xs font-semibold text-text">Árbol Binario</p>
              <p class="mt-1 text-xs text-text-muted">Zoom, pan, carga dinámica.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full max-w-[420px]">
        <div class="card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg font-semibold text-text">Iniciar sesión</p>
              <p class="text-sm text-text-muted">Credenciales del usuario admin en Laravel (Sanctum).</p>
            </div>
            <button class="btn btn-ghost" @click="ui.toggleTheme()">
              {{ ui.isDark ? 'Dark' : 'Light' }}
            </button>
          </div>

          <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
            <div>
              <label class="text-xs font-semibold text-text-muted">Email</label>
              <input v-model="email" class="input mt-1" placeholder="admin@empresa.com" />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-muted">Contraseña</label>
              <input v-model="password" type="password" class="input mt-1" autocomplete="current-password" />
            </div>

            <p
              v-if="errorMsg"
              class="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {{ errorMsg }}
            </p>

            <button class="btn btn-primary w-full" :disabled="busy">
              <span v-if="busy" class="inline-flex items-center gap-2">
                <span class="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                Entrando...
              </span>
              <span v-else>Entrar</span>
            </button>
          </form>

          <p class="mt-4 text-xs text-text-muted">
            Super Admin (seed): <span class="text-text">superadmin@imparables.shop</span> /
            <span class="text-text">ChangeMeNow!</span> o <span class="text-text">admin@empresa.com</span> /
            <span class="text-text">password</span>. El rol en BD es <span class="text-text">Super Admin</span> (Spatie).
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const email = ref('')
const password = ref('')
const busy = ref(false)
const errorMsg = ref('')

function loginErrorMessage(err) {
  const data = err?.response?.data
  if (data?.errors?.email?.[0]) return data.errors.email[0]
  if (data?.message) return data.message
  if (err?.message) return err.message
  return 'No se pudo iniciar sesión. Revisa credenciales o el estado del API.'
}

async function onSubmit() {
  busy.value = true
  errorMsg.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    const label = auth.user?.name || auth.user?.email || 'admin'
    ui.toast({ type: 'success', title: 'Bienvenido', message: `Sesión iniciada como ${label}` })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/dashboard'
    await router.push(redirect.startsWith('/') ? redirect : '/admin/dashboard')
  } catch (err) {
    errorMsg.value = loginErrorMessage(err)
    ui.toast({ type: 'error', title: 'Error de acceso', message: errorMsg.value })
  } finally {
    busy.value = false
  }
}
</script>

