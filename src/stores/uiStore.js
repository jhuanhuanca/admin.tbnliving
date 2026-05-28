import { defineStore } from 'pinia'

const THEME_KEY = 'mlm_admin_theme'

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'dark', // dark | light
    toasts: [],
    sidebarCollapsed: false,
    mobileDrawerOpen: false,
    commandPaletteOpen: false,
  }),
  getters: {
    isDark: (s) => s.theme === 'dark',
  },
  actions: {
    initTheme() {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === 'light' || saved === 'dark') this.theme = saved
      this.applyTheme()
    },
    applyTheme() {
      const root = document.documentElement
      if (this.theme === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')
      localStorage.setItem(THEME_KEY, this.theme)
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      this.applyTheme()
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    openMobileDrawer() {
      this.mobileDrawerOpen = true
    },
    closeMobileDrawer() {
      this.mobileDrawerOpen = false
    },
    toggleCommandPalette() {
      this.commandPaletteOpen = !this.commandPaletteOpen
    },
    closeCommandPalette() {
      this.commandPaletteOpen = false
    },
    toast({ type = 'info', title, message, timeoutMs = 3500 }) {
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
      this.toasts.push({ id, type, title, message })
      window.setTimeout(() => this.dismissToast(id), timeoutMs)
    },
    dismissToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})

