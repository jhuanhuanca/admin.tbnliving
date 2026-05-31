<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Pedidos y confirmación de pago</h1>
        <p class="text-sm text-text-muted">
          Confirma pagos en efectivo, QR u otros. Usa <strong>Ver ítems</strong> para alistar productos y paquetes antes de la entrega.
        </p>
      </div>
      <button class="btn btn-ghost" type="button" :disabled="admin.loading.orders" @click="load">Actualizar</button>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <label class="text-sm text-text-muted">Ver:</label>
      <select v-model="estadoFiltro" class="input w-auto" @change="load">
        <option value="pendiente_pago">Pendientes de pago</option>
        <option value="completado">Completados</option>
      </select>
    </div>

    <p v-if="error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{{ error }}</p>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Socio</th>
              <th class="px-4 py-3 font-semibold">Tipo</th>
              <th class="px-4 py-3 font-semibold">Ítems</th>
              <th class="px-4 py-3 text-end font-semibold">Total</th>
              <th class="px-4 py-3 font-semibold">Entrega</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
              <th class="px-4 py-3 font-semibold">Pago ref.</th>
              <th class="px-4 py-3 font-semibold">Factura</th>
              <th class="px-4 py-3 text-end font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="admin.loading.orders">
              <td colspan="10" class="px-4 py-8 text-center text-text-muted">Cargando…</td>
            </tr>
            <tr v-for="row in admin.orders.rows" v-else :key="row.id" class="border-t border-border">
              <td class="px-4 py-3">{{ row.id }}</td>
              <td class="px-4 py-3">
                {{ row.user?.name }}
                <span class="text-text-muted">({{ row.user?.member_code || '—' }})</span>
              </td>
              <td class="px-4 py-3">{{ row.tipo }}</td>
              <td class="px-4 py-3">
                <button type="button" class="btn btn-ghost btn-sm !px-2" @click="openDetail(row)">
                  Ver ítems
                  <span class="ml-1 text-text-muted">({{ orderItems(row).length }})</span>
                </button>
                <p v-if="orderItems(row).length" class="mt-1 max-w-[220px] truncate text-xs text-text-muted">
                  {{ itemsPreview(row) }}
                </p>
              </td>
              <td class="px-4 py-3 text-end font-semibold">{{ formatBs(row.total) }}</td>
              <td class="px-4 py-3">
                <span :class="deliveryModeBadgeClass(row.delivery_mode)">
                  {{ deliveryModeLabel(row.delivery_mode) }}
                </span>
                <p v-if="isShippingOrder(row)" class="mt-1 max-w-[180px] text-xs text-text-muted">
                  {{ deliverySummaryShort(row) }}
                </p>
                <p v-else-if="row.delivery_mode === 'recojo'" class="mt-1 text-xs text-text-muted">Sin envío</p>
              </td>
              <td class="px-4 py-3">
                <span v-if="row.estado === 'pendiente_pago'" class="badge badge-warn">Pendiente pago</span>
                <span v-else class="badge badge-success">{{ row.estado }}</span>
              </td>
              <td class="px-4 py-3 text-text-muted">{{ row.payment_method || '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <span class="text-xs text-text-muted">{{ row.invoice?.numero_factura || '—' }}</span>
                  <button
                    v-if="row.estado === 'completado'"
                    type="button"
                    class="btn btn-ghost btn-sm"
                    :disabled="imprimiendoId === row.id || printingDoc"
                    @click="imprimirFactura(row)"
                  >
                    {{ imprimiendoId === row.id || printingDoc ? '…' : 'Imprimir' }}
                  </button>
                </div>
              </td>
              <td class="px-4 py-3 text-end">
                <template v-if="row.estado === 'pendiente_pago'">
                  <div class="flex flex-wrap justify-end gap-1">
                    <select v-model="metodoConfirm[row.id]" class="input py-1 text-xs">
                      <option value="efectivo">Efectivo</option>
                      <option value="qr">QR</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="otro">Otro</option>
                    </select>
                    <input
                      v-model="notasConfirm[row.id]"
                      type="text"
                      class="input max-w-[140px] py-1 text-xs"
                      placeholder="Notas"
                    />
                    <button
                      type="button"
                      class="btn btn-primary btn-sm"
                      :disabled="procesandoId === row.id"
                      @click="confirmarPago(row)"
                    >
                      {{ procesandoId === row.id ? '…' : 'Confirmar' }}
                    </button>
                  </div>
                </template>
                <span v-else class="text-xs text-text-muted">
                  {{ row.payment_confirmed_at ? formatDate(row.payment_confirmed_at) : '—' }}
                </span>
              </td>
            </tr>
            <tr v-if="!admin.loading.orders && !admin.orders.rows.length">
              <td colspan="10" class="px-4 py-8 text-center text-text-muted">No hay pedidos en este filtro.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="admin.orders.meta?.total != null" class="border-t border-border px-4 py-2 text-xs text-text-muted">
        Total: {{ admin.orders.meta.total }} resultado(s)
      </p>
    </div>

    <Modal
      :open="detailOpen"
      title="Vista previa del pedido"
      :subtitle="detailSubtitle"
      @close="closeDetail"
    >
      <div v-if="selectedOrder" class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-border bg-white/2 px-3 py-2">
            <p class="text-xs text-text-muted">Cliente</p>
            <p class="text-sm font-semibold text-text">{{ selectedOrder.user?.name || '—' }}</p>
            <p class="text-xs text-text-muted">
              Código: {{ selectedOrder.user?.member_code || selectedOrder.user?.referral_code || '—' }}
              · {{ selectedOrder.user?.email || '—' }}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-white/2 px-3 py-2">
            <p class="text-xs text-text-muted">Pedido</p>
            <p class="text-sm font-semibold text-text">
              #{{ selectedOrder.id }} · {{ selectedOrder.tipo || '—' }}
            </p>
            <p class="text-xs text-text-muted">
              Estado: {{ selectedOrder.estado }} · Pago: {{ selectedOrder.payment_method || '—' }}
            </p>
          </div>
        </div>

        <div v-if="pickingSummary.length" class="rounded-xl border border-brand/30 bg-brand/5 px-3 py-3">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">Resumen para alistamiento</p>
          <ul class="space-y-1">
            <li v-for="(line, idx) in pickingSummary" :key="idx" class="flex items-center justify-between gap-2 text-sm">
              <span>
                <span :class="line.kindClass">{{ line.kind }}</span>
                {{ line.name }}
              </span>
              <strong class="shrink-0">× {{ line.qty }}</strong>
            </li>
          </ul>
        </div>

        <div
          v-if="selectedOrder"
          class="rounded-xl border px-3 py-3"
          :class="isShippingOrder(selectedOrder) ? 'border-warn/40 bg-warn/5' : 'border-border bg-white/2'"
        >
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Entrega y dirección</p>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span :class="deliveryModeBadgeClass(selectedOrder.delivery_mode)">
                {{ deliveryModeLabel(selectedOrder.delivery_mode) }}
              </span>
              <template v-if="isShippingOrder(selectedOrder)">
                <dl class="mt-2 space-y-1 text-sm">
                  <div v-if="selectedOrder.shipping_departamento">
                    <dt class="inline text-text-muted">Departamento:</dt>
                    <dd class="inline font-medium text-text">{{ selectedOrder.shipping_departamento }}</dd>
                  </div>
                  <div v-if="selectedOrder.shipping_ciudad">
                    <dt class="inline text-text-muted">Ciudad:</dt>
                    <dd class="inline font-medium text-text">{{ selectedOrder.shipping_ciudad }}</dd>
                  </div>
                  <div v-if="selectedOrder.shipping_direccion">
                    <dt class="block text-text-muted">Dirección:</dt>
                    <dd class="font-medium text-text">{{ selectedOrder.shipping_direccion }}</dd>
                  </div>
                </dl>
              </template>
              <p v-else class="mt-2 text-sm text-text-muted">El cliente retirará el pedido personalmente.</p>
            </div>
            <div v-if="shippingCostAmount(selectedOrder) > 0" class="text-right text-sm">
              <p class="text-xs text-text-muted">Costo de envío</p>
              <p class="font-semibold text-text">{{ formatBs(selectedOrder.shipping_cost) }}</p>
            </div>
          </div>
          <p class="mt-3 border-t border-border/60 pt-2 text-xs text-text-muted">
            {{ deliveryNoticeFor(selectedOrder) }}
          </p>
        </div>

        <div class="overflow-x-auto rounded-xl border border-border">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-white/3 text-xs text-text-muted">
              <tr>
                <th class="px-3 py-2 font-semibold">Tipo</th>
                <th class="px-3 py-2 font-semibold">Código</th>
                <th class="px-3 py-2 font-semibold">Descripción</th>
                <th class="px-3 py-2 text-end font-semibold">Cant.</th>
                <th class="px-3 py-2 text-end font-semibold">P. unit.</th>
                <th class="px-3 py-2 text-end font-semibold">Subtotal</th>
                <th class="px-3 py-2 text-end font-semibold">PV</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in orderItems(selectedOrder)" :key="item.id" class="border-t border-border">
                <td class="px-3 py-2">
                  <span :class="lineTypeBadgeClass(item)">{{ lineTypeLabel(item) }}</span>
                </td>
                <td class="px-3 py-2 font-mono text-xs text-text-muted">{{ lineCode(item) }}</td>
                <td class="px-3 py-2">{{ lineName(item) }}</td>
                <td class="px-3 py-2 text-end font-semibold">{{ item.cantidad ?? 1 }}</td>
                <td class="px-3 py-2 text-end">{{ formatBs(item.precio_unitario) }}</td>
                <td class="px-3 py-2 text-end font-semibold">{{ formatBs(item.precio_total) }}</td>
                <td class="px-3 py-2 text-end text-text-muted">{{ formatPv(item.pv_points) }}</td>
              </tr>
              <tr v-if="!orderItems(selectedOrder).length">
                <td colspan="7" class="px-3 py-6 text-center text-text-muted">Este pedido no tiene líneas registradas.</td>
              </tr>
            </tbody>
            <tfoot v-if="orderItems(selectedOrder).length">
              <tr v-if="shippingCostAmount(selectedOrder) > 0" class="border-t border-border bg-white/2">
                <td colspan="5" class="px-3 py-2 text-end text-xs text-text-muted">Subtotal productos</td>
                <td class="px-3 py-2 text-end">{{ formatBs(orderSubtotalBeforeShipping(selectedOrder)) }}</td>
                <td class="px-3 py-2"></td>
              </tr>
              <tr v-if="shippingCostAmount(selectedOrder) > 0" class="border-t border-border bg-white/2">
                <td colspan="5" class="px-3 py-2 text-end text-xs text-text-muted">Envío</td>
                <td class="px-3 py-2 text-end">{{ formatBs(selectedOrder.shipping_cost) }}</td>
                <td class="px-3 py-2"></td>
              </tr>
              <tr class="border-t border-border bg-white/2">
                <td colspan="5" class="px-3 py-2 text-end text-xs font-semibold text-text-muted">Total pedido</td>
                <td class="px-3 py-2 text-end font-semibold">{{ formatBs(selectedOrder.total) }}</td>
                <td class="px-3 py-2 text-end text-text-muted">{{ formatPv(selectedOrder.total_pv) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <button
            v-if="selectedOrder.estado === 'completado'"
            type="button"
            class="btn btn-ghost btn-sm"
            :disabled="printingDoc"
            @click="imprimirFactura(selectedOrder)"
          >
            Imprimir factura
          </button>
          <button type="button" class="btn btn-primary btn-sm" @click="closeDetail">Cerrar</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { useUiStore } from '@/stores/uiStore'
import { adminService } from '@/services/api/adminService'
import { usePrintDocument } from '@/composables/usePrintDocument'
import Modal from '@/components/admin/Modal.vue'
import {
  lineCode,
  lineName,
  lineTypeBadgeClass,
  lineTypeLabel,
  orderItems,
  orderItemsPreview,
  pickingSummaryFromItems,
} from '@/utils/orderLineDisplay'
import {
  deliveryModeBadgeClass,
  deliveryModeLabel,
  deliveryNoticeFor,
  deliverySummaryShort,
  isShippingOrder,
  orderSubtotalBeforeShipping,
  shippingCostAmount,
} from '@/utils/orderDeliveryDisplay'

const admin = useAdminStore()
const ui = useUiStore()
const { printing: printingDoc, printFromFetch } = usePrintDocument()

const estadoFiltro = ref('pendiente_pago')
const error = ref('')
const procesandoId = ref(null)
const imprimiendoId = ref(null)
const metodoConfirm = reactive({})
const notasConfirm = reactive({})
const detailOpen = ref(false)
const selectedOrder = ref(null)

const detailSubtitle = computed(() => {
  if (!selectedOrder.value) return ''
  const o = selectedOrder.value
  return `Pedido #${o.id} · ${o.user?.name || 'Cliente'} · ${formatBs(o.total)}`
})

const pickingSummary = computed(() =>
  selectedOrder.value ? pickingSummaryFromItems(orderItems(selectedOrder.value)) : []
)

function itemsPreview(row) {
  return orderItemsPreview(orderItems(row))
}

function formatBs(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(n)
}

function formatPv(v) {
  const n = Number(v)
  if (Number.isNaN(n) || n === 0) return '—'
  return new Intl.NumberFormat('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('es-BO')
  } catch {
    return iso
  }
}

function openDetail(row) {
  selectedOrder.value = row
  detailOpen.value = true
}

function closeDetail() {
  detailOpen.value = false
  selectedOrder.value = null
}

async function load() {
  error.value = ''
  try {
    await admin.fetchOrders({ estado: estadoFiltro.value })
    admin.orders.rows.forEach((r) => {
      if (metodoConfirm[r.id] == null) metodoConfirm[r.id] = r.payment_method || 'efectivo'
    })
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudieron cargar los pedidos.'
  }
}

async function confirmarPago(row) {
  procesandoId.value = row.id
  error.value = ''
  try {
    await admin.confirmOrderPayment(row.id, {
      payment_method: metodoConfirm[row.id] || row.payment_method || 'efectivo',
      notas: notasConfirm[row.id] || null,
    })
    notasConfirm[row.id] = ''
    ui.toast({ type: 'success', title: 'Pago confirmado', message: `Pedido #${row.id}` })
    await load()
    if (selectedOrder.value?.id === row.id) {
      selectedOrder.value = admin.orders.rows.find((r) => r.id === row.id) || null
    }
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo confirmar el pago.'
  } finally {
    procesandoId.value = null
  }
}

async function imprimirFactura(row) {
  imprimiendoId.value = row.id
  error.value = ''

  await printFromFetch(() => adminService.fetchOrderInvoicePrintHtml(row.id), {
    loadingMessage: 'Cargando factura…',
    onError: (msg) => {
      error.value = msg
    },
  })

  imprimiendoId.value = null
}

onMounted(load)
</script>
