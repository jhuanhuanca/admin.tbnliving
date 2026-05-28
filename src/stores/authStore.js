import { defineStore } from 'pinia'
import { authApi } from '@/services/api/auth.api'
import { ensureCsrfCookie } from '@/services/api/sanctum'
import { LS_AUTH_KEY, LS_TOKEN_KEY } from '@/services/api/httpClient'
import { usePermissionsStore } from '@/stores/permissionsStore'

const LS_KEY = LS_AUTH_KEY

function isSessionInvalid(err) {
  const status = err?.response?.status
  return status === 401 || status === 419
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    status: 'anonymous', // anonymous | authenticated
    user: null,
    sessionReady: false,
  }),
  getters: {
    isAuthed: (s) => s.status === 'authenticated' && !!s.user,
  },
  actions: {
    hydrate() {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (!raw) return

        const parsed = JSON.parse(raw)
        if (parsed?.user) {
          this.user = parsed.user
          this.status = 'authenticated'
        }
      } catch {
        // ignore
      }
    },

    async bootstrap() {
      if (this.sessionReady) return

      this.hydrate()

      try {
        await ensureCsrfCookie()
        await this.syncMe({ softFail: true })
      } catch {
        // syncMe limpia sesión en 401/419
      }

      this.sessionReady = true
    },

    async syncMe({ softFail = false } = {}) {
      const perms = usePermissionsStore()

      try {
        const res = await authApi.me()
        const a = res?.admin || res?.data?.admin || null

        if (!a) {
          if (!softFail) await this.logout()
          return
        }

        this.user = {
          id: a.id,
          uuid: a.uuid,
          name: a.name,
          lastname: a.lastname,
          email: a.email,
        }

        perms.setAuthz({
          roles: a.roles || [],
          permissions: a.permissions || [],
        })

        localStorage.setItem(LS_KEY, JSON.stringify({ user: this.user }))
        this.status = 'authenticated'
      } catch (err) {
        if (isSessionInvalid(err)) {
          await this.logout({ skipApi: true })
        }
        if (!softFail) throw err
      }
    },

    async login({ email, password }) {
      const res = await authApi.login({ email, password, device_name: 'panel' })
      const u = res?.admin || res?.data?.admin || null
      const token = res?.access_token || res?.data?.access_token || null

      if (!u) {
        const msg = res?.message || 'Respuesta de login inválida del servidor.'
        throw Object.assign(new Error(msg), { response: { data: res } })
      }

      if (token) {
        localStorage.setItem(LS_TOKEN_KEY, String(token).trim())
      }

      this.user = {
        id: u.id,
        uuid: u.uuid,
        name: u.name,
        lastname: u.lastname,
        email: u.email,
      }
      this.status = 'authenticated'
      localStorage.setItem(LS_KEY, JSON.stringify({ user: this.user }))

      await this.syncMe()

      if (!this.user) {
        throw new Error('No se pudo validar la sesión con el servidor.')
      }

      this.sessionReady = true
    },

    async logout({ skipApi = false } = {}) {
      const perms = usePermissionsStore()

      if (!skipApi) {
        try {
          await authApi.logout()
        } catch {
          // Sesión ya inválida en servidor.
        }
      }

      this.user = null
      this.status = 'anonymous'
      this.sessionReady = false
      perms.clear()
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(LS_TOKEN_KEY)
    },
  },
})
