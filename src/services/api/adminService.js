import { http } from './httpClient'
import { assertPrintHtmlResponse } from '@/utils/printHtml'
import { buildMultipartBody } from '@/utils/multipartForm'

/** Normaliza respuesta paginada Laravel (axios response) */
function paginatedRows(axiosRes) {
  const body = axiosRes?.data
  if (!body) return { rows: [], meta: null }
  if (Array.isArray(body.data)) {
    return {
      rows: body.data,
      meta: {
        current_page: body.current_page,
        last_page: body.last_page,
        total: body.total,
        per_page: body.per_page,
      },
    }
  }
  if (Array.isArray(body)) return { rows: body, meta: null }
  return { rows: [], meta: null }
}

export const adminService = {
  // --- DASHBOARD (payload real Laravel AdminDashboardController) ---
  async getStats() {
    const body = (await http.get('/api/v1/admin/dashboard/kpis')).data
    if (body && body.success === true && body.data) {
      return body.data
    }
    return body
  },

  /** Alias explícito con charts, top_members e items KPI */
  async getDashboard() {
    return this.getStats()
  },

  // --- USUARIOS ---
  async listUsers({ q = '', status = 'all', page = 1, pageSize = 10 } = {}) {
    return (
      await http.get('/api/v1/admin/users', {
        params: { q, status, page, pageSize },
      })
    ).data
  },

  // --- COMISIONES ---
  async listCommissions({ from, to, type = 'all' } = {}) {
    return (await http.get('/api/v1/admin/commissions', { params: { from, to, type } })).data
  },

  // --- WALLET ---
  async getWalletSummary() {
    return (await http.get('/api/v1/admin/wallet/summary')).data
  },

  // --- RETIROS ---
  async listWithdrawals({ estado = 'pendiente', per_page = 50 } = {}) {
    const res = await http.get('/api/v1/admin/withdrawals', { params: { estado, per_page } })
    return paginatedRows(res)
  },

  async approveWithdrawal(id) {
    return (await http.post(`/api/v1/admin/withdrawals/${id}/approve`)).data
  },

  async rejectWithdrawal(id, payload = {}) {
    return (await http.post(`/api/v1/admin/withdrawals/${id}/reject`, payload)).data
  },

  // --- TICKETS SOPORTE ---
  async listSupportTickets({ estado = 'all', prioridad = 'all', per_page = 50 } = {}) {
    const res = await http.get('/api/v1/admin/support-tickets', { params: { estado, prioridad, per_page } })
    return paginatedRows(res)
  },

  async updateSupportTicket(id, payload = {}) {
    return (await http.patch(`/api/v1/admin/support-tickets/${id}`, payload)).data
  },

  // --- PEDIDOS ---
  async listOrders({ estado = 'pendiente_pago', per_page = 50 } = {}) {
    const res = await http.get('/api/v1/admin/orders', { params: { estado, per_page } })
    return paginatedRows(res)
  },

  async confirmOrderPayment(orderId, payload) {
    return (await http.post(`/api/v1/admin/orders/${orderId}/confirm-payment`, payload)).data
  },

  async fetchOrderPaymentProof(orderId) {
    const res = await http.get(`/api/v1/admin/orders/${orderId}/payment-proof`, {
      responseType: 'blob',
    })
    const mime = res.headers?.['content-type'] || res.data?.type || 'application/octet-stream'

    return { blob: res.data, mime }
  },

  // --- IMPRESIÓN (HTML → ventana emergente → Guardar como PDF) ---
  async fetchOrderInvoicePrintHtml(orderId) {
    const res = await http.get(`/api/v1/admin/orders/${orderId}/invoice/print`, {
      responseType: 'text',
      transformResponse: [(data) => (typeof data === 'string' ? data : String(data ?? ''))],
      headers: {
        Accept: 'text/html, application/xhtml+xml;q=0.9, */*;q=0.8',
      },
    })
    return assertPrintHtmlResponse(res)
  },

  async fetchWithdrawalPrintHtml(withdrawalId) {
    const res = await http.get(`/api/v1/admin/withdrawals/${withdrawalId}/print`, {
      responseType: 'text',
      transformResponse: [(data) => (typeof data === 'string' ? data : String(data ?? ''))],
      headers: {
        Accept: 'text/html, application/xhtml+xml;q=0.9, */*;q=0.8',
      },
    })
    return assertPrintHtmlResponse(res)
  },

  // --- PRODUCTOS / CATEGORÍAS ---
  async listCategories() {
    const res = (await http.get('/api/v1/admin/categories')).data
    return res.data ?? res ?? []
  },

  async listProducts() {
    const res = (await http.get('/api/v1/admin/products')).data
    return { rows: res.data ?? [] }
  },

  async createProduct(payload) {
    return (await http.post('/api/v1/admin/products', payload)).data
  },

  async updateProduct(id, payload) {
    return (await http.put(`/api/v1/admin/products/${id}`, payload)).data
  },

  async deleteProduct(id) {
    return (await http.delete(`/api/v1/admin/products/${id}`)).data
  },

  // --- PAQUETES ---
  async listPackages() {
    const res = (await http.get('/api/v1/admin/packages')).data
    return { rows: res.data ?? [] }
  },

  async createPackage(payload) {
    return (await http.post('/api/v1/admin/packages', payload)).data
  },

  async updatePackage(id, payload) {
    return (await http.put(`/api/v1/admin/packages/${id}`, payload)).data
  },

  async deletePackage(id) {
    return (await http.delete(`/api/v1/admin/packages/${id}`)).data
  },

  // --- RECONCILIACIÓN / LIDERAZGO ---
  async listPeriodClosures({ per_page = 50 } = {}) {
    const res = await http.get('/api/v1/admin/reconciliation/period-closures', { params: { per_page } })
    return paginatedRows(res)
  },

  async listCommissionSummary({ period_key, period_type } = {}) {
    const res = (
      await http.get('/api/v1/admin/reconciliation/commission-summary', {
        params: { period_key, period_type },
      })
    ).data
    return res.data ?? []
  },

  async getLeadershipMonth(monthKey) {
    return (await http.get(`/api/v1/admin/leadership/${encodeURIComponent(monthKey)}`)).data
  },

  // --- ÁRBOL BINARIO ---
  async searchBinaryTreeUsers(q) {
    const res = (await http.get('/api/v1/admin/tree/search', { params: { q } })).data
    return res?.results ?? []
  },

  async getBinaryTreeUser(userId) {
    const res = (await http.get(`/api/v1/admin/tree/user/${userId}`)).data
    return res?.user ?? null
  },

  async getBinaryTreeRoot(params = {}) {
    const res = (await http.get('/api/v1/admin/tree/root', { params })).data
    return res?.node ?? res
  },

  async getBinaryTreeRootPayload(params = {}) {
    return (await http.get('/api/v1/admin/tree/root', { params })).data
  },

  async getBinaryNodeChildren(nodeId) {
    const res = (await http.get(`/api/v1/admin/tree/${nodeId}/children`)).data
    return res?.node ?? null
  },

  // --- EVENTOS / NOTICIAS ---
  async listEvents() {
    const res = (await http.get('/api/v1/admin/events')).data
    return { rows: res.data ?? [] }
  },

  async createEvent(payload, flyerFile = null) {
    const form = buildMultipartBody(payload, 'flyer', flyerFile)
    return (await http.post('/api/v1/admin/events', form)).data
  },

  async updateEvent(id, payload, flyerFile = null) {
    const form = buildMultipartBody(payload, 'flyer', flyerFile)
    return (await http.put(`/api/v1/admin/events/${id}`, form)).data
  },

  async deactivateEvent(id) {
    return (await http.delete(`/api/v1/admin/events/${id}`)).data
  },

  async listNews() {
    const res = (await http.get('/api/v1/admin/news')).data
    return { rows: res.data ?? [] }
  },

  async createNews(payload, imageFile = null) {
    const form = buildMultipartBody(payload, 'image', imageFile)
    return (await http.post('/api/v1/admin/news', form)).data
  },

  async updateNews(id, payload, imageFile = null) {
    const form = buildMultipartBody(payload, 'image', imageFile)
    return (await http.put(`/api/v1/admin/news/${id}`, form)).data
  },

  async deactivateNews(id) {
    return (await http.delete(`/api/v1/admin/news/${id}`)).data
  },

  async listEventRegistrations({ estado = 'pendiente_pago', per_page = 50 } = {}) {
    const res = await http.get('/api/v1/admin/event-registrations', { params: { estado, per_page } })
    return paginatedRows(res)
  },

  async confirmEventRegistration(id, payload) {
    return (await http.post(`/api/v1/admin/event-registrations/${id}/confirm-payment`, payload)).data
  },

  async fetchEventRegistrationPaymentProof(id) {
    const res = await http.get(`/api/v1/admin/event-registrations/${id}/payment-proof`, {
      responseType: 'blob',
    })
    const mime = res.headers?.['content-type'] || res.data?.type || 'application/octet-stream'
    return { blob: res.data, mime }
  },
}
