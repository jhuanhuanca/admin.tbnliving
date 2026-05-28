<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Pedidos y confirmación de pago</h1>
        <p class="text-sm text-text-muted">
          Confirma pagos en efectivo, QR u otros. Al confirmar, el pedido pasa a completado y se encolan comisiones MLM.
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
              <th class="px-4 py-3 text-end font-semibold">Total</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
              <th class="px-4 py-3 font-semibold">Pago ref.</th>
              <th class="px-4 py-3 font-semibold">Factura</th>
              <th class="px-4 py-3 text-end font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="admin.loading.orders">
              <td colspan="8" class="px-4 py-8 text-center text-text-muted">Cargando…</td>
            </tr>
            <tr v-for="row in admin.orders.rows" v-else :key="row.id" class="border-t border-border">
              <td class="px-4 py-3">{{ row.id }}</td>
              <td class="px-4 py-3">
                {{ row.user?.name }}
                <span class="text-text-muted">({{ row.user?.member_code || '—' }})</span>
              </td>
              <td class="px-4 py-3">{{ row.tipo }}</td>
              <td class="px-4 py-3 text-end font-semibold">{{ formatBs(row.total) }}</td>
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
              <td colspan="8" class="px-4 py-8 text-center text-text-muted">No hay pedidos en este filtro.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="admin.orders.meta?.total != null" class="border-t border-border px-4 py-2 text-xs text-text-muted">
        Total: {{ admin.orders.meta.total }} resultado(s)
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { useUiStore } from '@/stores/uiStore'
import { adminService } from '@/services/api/adminService'
import { usePrintDocument } from '@/composables/usePrintDocument'

const admin = useAdminStore()
const ui = useUiStore()
const { printing: printingDoc, printFromFetch } = usePrintDocument()

const estadoFiltro = ref('pendiente_pago')
const error = ref('')
const procesandoId = ref(null)
const imprimiendoId = ref(null)
const metodoConfirm = reactive({})
const notasConfirm = reactive({})

function formatBs(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(n)
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('es-BO')
  } catch {
    return iso
  }
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
