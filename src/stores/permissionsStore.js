import { defineStore } from 'pinia'

/** Alias legacy del front → nombre real del rol en Spatie (guard admin_api). */
const ROLE_ALIASES = {
  superadmin: 'Super Admin',
  'super-admin': 'Super Admin',
  support: 'Support Admin',
  admin: 'Financial Admin',
}

function normalizeRole(role) {
  const key = String(role || '').trim().toLowerCase()
  return ROLE_ALIASES[key] || role
}

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    roles: [],
    permissions: [],
    hydratedAt: null,
  }),
  getters: {
    isSuperAdmin: (s) =>
      s.roles.includes('Super Admin') ||
      s.roles.some((r) => String(r).toLowerCase() === 'superadmin'),
    hasRole: (s) => (role) => {
      const wanted = normalizeRole(role)
      return s.roles.includes(wanted) || s.roles.includes(role)
    },
    can: (s) => (perm) => {
      if (s.permissions.includes('*') || s.permissions.includes(perm)) return true
      if (s.roles.includes('Super Admin')) return true
      // Alias legacy del panel (nav antiguo)
      if (perm === 'commissions.manage') {
        return (
          s.permissions.includes('withdrawals.approve') ||
          s.permissions.includes('withdrawals.view')
        )
      }
      return false
    },
  },
  actions: {
    setAuthz({ roles = [], permissions = [] } = {}) {
      this.roles = Array.isArray(roles) ? roles : []
      this.permissions = Array.isArray(permissions) ? permissions : []
      this.hydratedAt = new Date().toISOString()
    },
    clear() {
      this.roles = []
      this.permissions = []
      this.hydratedAt = null
    },
  },
})
