import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    open: false,
    unread: 0,
    items: [],
  }),
  actions: {
    toggle() {
      this.open = !this.open
    },
    close() {
      this.open = false
    },
    // Placeholder: cuando el backend exponga /api/v1/security/notifications lo conectamos aquí.
    seedMock() {
      if (this.items.length) return
      this.items = [
        { id: 'n1', title: 'Sync', body: 'Sincronización OK (últimos 5 min).', ts: new Date().toISOString(), level: 'info' },
        { id: 'n2', title: 'Retiros', body: 'Hay solicitudes pendientes por revisar.', ts: new Date().toISOString(), level: 'warn' },
      ]
      this.unread = this.items.length
    },
    markAllRead() {
      this.unread = 0
    },
  },
})

