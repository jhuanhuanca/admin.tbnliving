import { defineStore } from 'pinia'
import { adminService } from '@/services/api/adminService'

function withdrawalEstadoParam(status) {
  const direct = ['all', 'pendiente', 'aprobado', 'completado', 'rechazado']
  if (direct.includes(status)) return status
  const m = {
    all: 'all',
    pending: 'pendiente',
    approved: 'aprobado',
    completed: 'completado',
    rejected: 'rechazado',
  }
  return m[status] ?? 'pendiente'
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    loading: {
      stats: false,
      users: false,
      commissions: false,
      wallet: false,
      withdrawals: false,
      products: false,
      orders: false,
    },

    /** Respuesta cruda de GET /api/admin/dashboard */
    stats: null,

    users: {
      rows: [],
      total: 0,
      page: 1,
      pageSize: 10,
      q: '',
      status: 'all',
    },

    commissions: {
      rows: [],
      totalAmount: 0,
      filters: { type: 'all', from: null, to: null },
    },

    wallet: null,

    withdrawals: {
      rows: [],
      meta: null,
      status: 'pending',
    },

    orders: {
      rows: [],
      meta: null,
      estado: 'pendiente_pago',
    },

    products: {
      rows: [],
    },
  }),
  actions: {
    async fetchStats() {
      this.loading.stats = true
      try {
        this.stats = await adminService.getStats()
      } finally {
        this.loading.stats = false
      }
    },

    async fetchUsers({ q, status, page, pageSize } = {}) {
      this.loading.users = true
      try {
        const next = await adminService.listUsers({
          q: q ?? this.users.q,
          status: status ?? this.users.status,
          page: page ?? this.users.page,
          pageSize: pageSize ?? this.users.pageSize,
        })
        this.users = {
          ...this.users,
          q: q ?? this.users.q,
          status: status ?? this.users.status,
          page: next.page,
          pageSize: next.pageSize,
          total: next.total,
          rows: next.rows,
        }
      } finally {
        this.loading.users = false
      }
    },

    async fetchCommissions(filters = {}) {
      this.loading.commissions = true
      try {
        const merged = { ...this.commissions.filters, ...filters }
        const res = await adminService.listCommissions(merged)
        this.commissions = { ...this.commissions, filters: merged, ...res }
      } finally {
        this.loading.commissions = false
      }
    },

    async fetchWallet() {
      this.loading.wallet = true
      try {
        this.wallet = await adminService.getWalletSummary()
      } finally {
        this.loading.wallet = false
      }
    },

    async fetchWithdrawals({ status, per_page = 50 } = {}) {
      this.loading.withdrawals = true
      try {
        const nextStatus = status ?? this.withdrawals.status
        const estado = withdrawalEstadoParam(nextStatus)
        const { rows, meta } = await adminService.listWithdrawals({
          estado,
          per_page,
        })
        this.withdrawals = { rows, meta, status: nextStatus }
      } finally {
        this.loading.withdrawals = false
      }
    },

    async approveWithdrawal(id) {
      await adminService.approveWithdrawal(id)
      await this.fetchWithdrawals()
    },

    async rejectWithdrawal(id, notas = null) {
      await adminService.rejectWithdrawal(id, { notas_admin: notas })
      await this.fetchWithdrawals()
    },

    async fetchOrders({ estado } = {}) {
      this.loading.orders = true
      try {
        const e = estado ?? this.orders.estado
        const { rows, meta } = await adminService.listOrders({ estado: e, per_page: 50 })
        this.orders = { rows, meta, estado: e }
      } finally {
        this.loading.orders = false
      }
    },

    async confirmOrderPayment(orderId, payload) {
      await adminService.confirmOrderPayment(orderId, payload)
      await this.fetchOrders()
    },

    async fetchProducts() {
      this.loading.products = true
      try {
        const res = await adminService.listProducts()
        this.products = { rows: res.rows }
      } finally {
        this.loading.products = false
      }
    },

    async createProduct(payload) {
      this.loading.products = true
      try {
        await adminService.createProduct(payload)
        await this.fetchProducts()
      } finally {
        this.loading.products = false
      }
    },

    async updateProduct(id, payload) {
      this.loading.products = true
      try {
        await adminService.updateProduct(id, payload)
        await this.fetchProducts()
      } finally {
        this.loading.products = false
      }
    },

    async deleteProduct(id) {
      this.loading.products = true
      try {
        await adminService.deleteProduct(id)
        await this.fetchProducts()
      } finally {
        this.loading.products = false
      }
    },
  },
})
