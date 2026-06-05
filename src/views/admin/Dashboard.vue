<template>
  <div class="space-y-6">
    <div class="card overflow-hidden border-brand/20 bg-gradient-to-br from-bg-2 to-bg">
      <div class="card-body flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-text">Panel empresa</h1>
          <p class="text-sm text-text-muted">KPIs MLM, ventas y comisiones (API Laravel).</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="badge badge-info">{{ rolEtiqueta }}</span>
          <button class="btn btn-ghost" type="button" :disabled="admin.loading.stats" @click="refresh">Actualizar</button>
        </div>
      </div>
    </div>

    <p v-if="error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{{ error }}</p>

    <div v-if="admin.loading.stats && !admin.stats" class="space-y-3">
      <div class="skeleton h-24 w-full rounded-xl" />
      <div class="skeleton h-64 w-full rounded-xl" />
    </div>

    <template v-else-if="admin.stats">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPIBox
          title="Ingresos pedidos (completados)"
          :value="Number(admin.stats.orders_revenue_total) || 0"
          format="currency"
          hint="Acumulado histórico"
        />
        <KPIBox
          title="Comisiones (hist.)"
          :value="Number(admin.stats.commissions_paid_total) || 0"
          format="currency"
          hint="Eventos acumulados"
        />
        <KPIBox title="Nuevos este mes" :value="String(admin.stats.users_new_this_month ?? 0)" hint="Registros" />
        <KPIBox
          title="Volumen binario"
          :value="formatPv(admin.stats.binary_volume_current_period)"
          format="number"
          :hint="`Periodo ${admin.stats.binary_period_key || '—'}`"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <KPIBox title="Usuarios totales" :value="String(admin.stats.users_total ?? 0)" hint="Base" />
        <RouterLink to="/admin/withdrawals" class="block">
          <KPIBox title="Retiros pendientes" :value="String(admin.stats.withdrawals_pending ?? 0)" hint="Ir a gestión →" />
        </RouterLink>
        <KPIBox title="Pedidos hoy" :value="String(admin.stats.orders_today ?? 0)" hint="Creados hoy" />
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div class="card">
          <div class="card-header">
            <p class="text-sm font-semibold text-text">Ventas — últimos 6 meses</p>
            <p class="text-xs text-text-muted">Pedidos completados por mes (Bs.)</p>
          </div>
          <div class="card-body chart-wrap">
            <canvas ref="salesCanvas" />
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <p class="text-sm font-semibold text-text">Comisiones por tipo</p>
            <p class="text-xs text-text-muted">Suma histórica por tipo de evento (Bs.)</p>
          </div>
          <div class="card-body chart-wrap">
            <canvas ref="commissionsCanvas" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div class="card lg:col-span-2">
          <div class="card-header">
            <p class="text-sm font-semibold text-text">Distribución de rangos</p>
            <p class="text-xs text-text-muted">Socios por segmento de volumen</p>
          </div>
          <div class="card-body chart-wrap chart-wrap--doughnut">
            <canvas ref="ranksCanvas" />
          </div>
        </div>
        <div class="card lg:col-span-3">
          <div class="card-header">
            <p class="text-sm font-semibold text-text">Ranking — PV mensual</p>
            <p class="text-xs text-text-muted">Top 10 por calificación del mes</p>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-white/3 text-xs text-text-muted">
                <tr>
                  <th class="px-4 py-3 font-semibold">#</th>
                  <th class="px-4 py-3 font-semibold">Socio</th>
                  <th class="px-4 py-3 font-semibold">Código</th>
                  <th class="px-4 py-3 font-semibold">Rango</th>
                  <th class="px-4 py-3 text-end font-semibold">PV mes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(m, idx) in admin.stats.top_members || []" :key="m.id" class="border-t border-border">
                  <td class="px-4 py-3 text-text-muted">{{ idx + 1 }}</td>
                  <td class="px-4 py-3 font-medium text-text">{{ m.name }}</td>
                  <td class="px-4 py-3 text-text-muted">{{ m.member_code }}</td>
                  <td class="px-4 py-3">
                    <span class="badge badge-warn">{{ m.rank_name }}</span>
                  </td>
                  <td class="px-4 py-3 text-end font-semibold text-text">{{ formatPv(m.monthly_qualifying_pv) }}</td>
                </tr>
                <tr v-if="!(admin.stats.top_members || []).length">
                  <td colspan="5" class="px-4 py-8 text-center text-text-muted">Sin datos de socios.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-text">Gestión de retiros</p>
            <p class="text-xs text-text-muted">
              Aprueba o rechaza solicitudes. El saldo quedó retenido al solicitar.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <label class="text-xs text-text-muted">Estado</label>
            <select v-model="filtroRetirosEstado" class="input w-auto py-1 text-sm">
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="completado">Completados</option>
              <option value="rechazado">Rechazados</option>
              <option value="all">Todos</option>
            </select>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="retirosLoading"
              @click="loadRetiros"
            >
              Actualizar
            </button>
            <RouterLink to="/admin/withdrawals" class="btn btn-primary btn-sm">Vista completa</RouterLink>
          </div>
        </div>
        <div class="overflow-x-auto">
          <p v-if="retirosError" class="px-4 py-3 text-sm text-danger">{{ retirosError }}</p>
          <p v-if="retirosLoading" class="px-4 py-8 text-center text-sm text-text-muted">Cargando retiros…</p>
          <table v-else class="min-w-full text-left text-sm">
            <thead class="bg-white/3 text-xs text-text-muted">
              <tr>
                <th class="px-4 py-3 font-semibold">ID</th>
                <th class="px-4 py-3 font-semibold">Socio</th>
                <th class="px-4 py-3 font-semibold">Monto</th>
                <th class="px-4 py-3 font-semibold">Estado</th>
                <th class="px-4 py-3 text-end font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in retirosItems" :key="w.id" class="border-t border-border">
                <td class="px-4 py-3 font-medium">{{ w.id }}</td>
                <td class="px-4 py-3">
                  <div class="font-medium text-text">{{ w.user?.name || '—' }}</div>
                  <div class="text-xs text-text-muted">
                    {{ w.user?.email || '—' }} · código {{ w.user?.member_code || '—' }}
                  </div>
                </td>
                <td class="px-4 py-3 font-semibold text-text">{{ formatBs(w.monto) }}</td>
                <td class="px-4 py-3">
                  <span class="badge text-xs" :class="estadoBadgeClass(w.estado)">{{ w.estado }}</span>
                </td>
                <td class="px-4 py-3 text-end">
                  <template v-if="w.estado === 'pendiente'">
                    <button
                      type="button"
                      class="btn btn-success btn-sm"
                      :disabled="retiroProcesandoId === w.id"
                      @click="aprobarRetiro(w.id)"
                    >
                      {{ retiroProcesandoId === w.id ? '…' : 'Aprobar' }}
                    </button>
                    <div class="mt-2 flex flex-wrap items-center justify-end gap-1">
                      <input
                        v-model="notasRechazo[w.id]"
                        type="text"
                        class="input max-w-[180px] py-1 text-xs"
                        placeholder="Motivo rechazo (opc.)"
                      />
                      <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        :disabled="retiroProcesandoId === w.id"
                        @click="rechazarRetiro(w.id)"
                      >
                        Rechazar
                      </button>
                    </div>
                  </template>
                  <span v-else class="text-xs text-text-muted">—</span>
                </td>
              </tr>
              <tr v-if="!retirosItems.length">
                <td colspan="5" class="px-4 py-8 text-center text-text-muted">
                  No hay retiros con este filtro.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          v-if="retirosMeta?.total != null"
          class="border-t border-border px-4 py-2 text-xs text-text-muted"
        >
          {{ retirosMeta.total }} registro(s)
        </p>
      </div>

      <div>
        <h2 class="mb-2 text-sm font-semibold text-text">Módulos</h2>
        <p class="mb-4 text-xs text-text-muted">Gestión operativa del MLM</p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <RouterLink v-for="m in modulos" :key="m.to" :to="m.to" class="card card-interactive block">
            <div class="card-body">
              <p class="text-sm font-semibold text-text">{{ m.title }}</p>
              <p class="mt-1 text-xs text-text-muted">{{ m.text }}</p>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="card">
        <button
          type="button"
          class="card-header flex w-full cursor-pointer items-center justify-between text-left"
          @click="mostrarGuia = !mostrarGuia"
        >
          <span class="text-sm font-semibold text-text">Guía: inscripción, pedidos y retiros</span>
          <span class="text-text-muted">{{ mostrarGuia ? '▲' : '▼' }}</span>
        </button>
        <div v-show="mostrarGuia" class="card-body space-y-3 text-sm text-text-muted">
          <p>
            El socio se registra con <code class="rounded bg-bg-2 px-1">POST /api/register</code>. Los pedidos en
            <strong>pendiente de pago</strong> se confirman desde <RouterLink class="text-brand underline" to="/admin/orders">Órdenes</RouterLink>.
            Los retiros requieren aprobación en <RouterLink class="text-brand underline" to="/admin/withdrawals">Retiros</RouterLink>.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import KPIBox from '@/components/admin/KPIBox.vue'
import { useAdminStore } from '@/stores/adminStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { adminService } from '@/services/api/adminService'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import { formatBob, formatBobAxis } from '@/utils/money'

Chart.register(...registerables)

const admin = useAdminStore()
const auth = useAuthStore()
const ui = useUiStore()

const error = ref('')
const mostrarGuia = ref(false)
const filtroRetirosEstado = ref('pendiente')
const retirosItems = ref([])
const retirosMeta = ref(null)
const retirosLoading = ref(false)
const retirosError = ref('')
const retiroProcesandoId = ref(null)
const notasRechazo = reactive({})

const salesCanvas = ref(null)
const commissionsCanvas = ref(null)
const ranksCanvas = ref(null)
let chartSales = null
let chartCommissions = null
let chartRanks = null

const rolEtiqueta = computed(() => {
  const r = auth.role
  if (r === 'superadmin') return 'Superadministrador'
  if (r === 'admin') return 'Administrador'
  if (r === 'support') return 'Soporte'
  return r || '—'
})

const modulos = [
  { to: '/admin/products', title: 'Productos', text: 'Catálogo, PV, precios BOB y cliente preferente.' },
  { to: '/admin/packages', title: 'Paquetes', text: 'Inscripción y venta: PV, precio, monto comisionable.' },
  { to: '/admin/orders', title: 'Pedidos (pagos)', text: 'Confirmar efectivo, QR o transferencia pendientes.' },
  { to: '/admin/withdrawals', title: 'Retiros', text: 'Aprobar o rechazar solicitudes de retiro.' },
  { to: '/admin/support-tickets', title: 'Tickets soporte', text: 'Seguimiento a solicitudes de socios y clientes.' },
  { to: '/admin/events-news', title: 'Eventos y noticias', text: 'Capacitaciones virtuales/presenciales, flyers e inscripciones.' },
  { to: '/admin/reports', title: 'Reconciliación', text: 'Cierres de periodo, comisiones por clave y liderazgo.' },
  { to: '/admin/users', title: 'Usuarios', text: 'Búsqueda y estado de cuenta.' },
  { to: '/admin/tree', title: 'Árbol binario', text: 'Exploración de red binaria.' },
  { to: '/admin/commissions', title: 'Comisiones', text: 'Listado filtrable por tipo y fechas.' },
]

function formatBs(value) {
  return formatBob(value)
}

function formatPv(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return `${n.toLocaleString('es-BO', { maximumFractionDigits: 2 })} PV`
}

function moneyChartOptions(showLegend = true) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: showLegend },
      tooltip: {
        callbacks: {
          label(ctx) {
            const v = ctx.parsed?.y ?? ctx.parsed ?? 0
            return `${ctx.dataset.label}: ${formatBob(v)}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => formatBobAxis(v),
        },
      },
    },
  }
}

function destroyCharts() {
  chartSales?.destroy()
  chartCommissions?.destroy()
  chartRanks?.destroy()
  chartSales = null
  chartCommissions = null
  chartRanks = null
}

function buildCharts() {
  destroyCharts()
  const ch = admin.stats?.charts || {}
  const sales = ch.sales_last_6_months || []
  const byType = ch.commissions_by_type || {}
  const ranks = ch.rank_distribution || []

  if (salesCanvas.value && sales.length) {
    chartSales = new Chart(salesCanvas.value, {
      type: 'line',
      data: {
        labels: sales.map((r) => r.month),
        datasets: [
          {
            label: 'Ventas completadas (Bs.)',
            data: sales.map((r) => Number(r.total)),
            borderColor: '#f0b90b',
            backgroundColor: 'rgba(240, 185, 11, 0.15)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: moneyChartOptions(true),
    })
  }

  const typeLabels = Object.keys(byType)
  const typeValues = typeLabels.map((k) => Number(byType[k]))
  if (commissionsCanvas.value && typeLabels.length) {
    chartCommissions = new Chart(commissionsCanvas.value, {
      type: 'bar',
      data: {
        labels: typeLabels.map((t) => String(t).toUpperCase()),
        datasets: [
          {
            label: 'Monto (Bs.)',
            data: typeValues,
            backgroundColor: ['#fb6340', '#2dce89', '#11cdef', '#f5365c', '#8965e0', '#8898aa'].slice(
              0,
              typeLabels.length,
            ),
          },
        ],
      },
      options: moneyChartOptions(false),
    })
  }

  if (ranksCanvas.value && ranks.length) {
    chartRanks = new Chart(ranksCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ranks.map((r) => r.name),
        datasets: [
          {
            data: ranks.map((r) => r.total),
            backgroundColor: ['#5e72e4', '#2dce89', '#fb6340', '#11cdef', '#f5365c', '#8965e0', '#172b4d', '#8898aa'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    })
  }
}

function estadoBadgeClass(estado) {
  const m = {
    pendiente: 'badge-warn',
    aprobado: 'badge-info',
    completado: 'badge-success',
    rechazado: 'badge-danger',
  }
  return m[estado] || 'badge-ghost'
}

/** Misma lógica que AdminRetiros.vue (test-front) */
async function loadRetiros() {
  retirosLoading.value = true
  retirosError.value = ''
  try {
    const { rows, meta } = await adminService.listWithdrawals({
      estado: filtroRetirosEstado.value,
      per_page: 50,
    })
    retirosItems.value = rows || []
    retirosMeta.value = meta
  } catch (e) {
    retirosItems.value = []
    retirosMeta.value = null
    const msg = e?.response?.data?.message || e?.message || ''
    retirosError.value = msg
      ? `No se pudieron cargar los retiros: ${msg}`
      : 'No se pudieron cargar los retiros (¿sesión admin o permisos?).'
  } finally {
    retirosLoading.value = false
  }
}

async function aprobarRetiro(id) {
  retiroProcesandoId.value = id
  retirosError.value = ''
  try {
    await admin.approveWithdrawal(id)
    ui.toast({ type: 'success', title: 'Retiro aprobado', message: `ID ${id}` })
    await Promise.all([loadRetiros(), admin.fetchStats()])
  } catch (e) {
    retirosError.value = apiErrorMessage(e, 'Error al aprobar.')
  } finally {
    retiroProcesandoId.value = null
  }
}

async function rechazarRetiro(id) {
  retiroProcesandoId.value = id
  retirosError.value = ''
  try {
    await admin.rejectWithdrawal(id, notasRechazo[id] || null)
    notasRechazo[id] = ''
    ui.toast({ type: 'danger', title: 'Retiro rechazado', message: `ID ${id}` })
    await Promise.all([loadRetiros(), admin.fetchStats()])
  } catch (e) {
    retirosError.value = apiErrorMessage(e, 'Error al rechazar.')
  } finally {
    retiroProcesandoId.value = null
  }
}

async function refresh() {
  error.value = ''
  try {
    await Promise.all([admin.fetchStats(), loadRetiros()])
    await nextTick()
    buildCharts()
  } catch {
    error.value = 'No se pudo cargar el panel (¿sesión de administrador?).'
  }
}

watch(filtroRetirosEstado, () => {
  loadRetiros()
})

watch(
  () => admin.stats,
  async () => {
    await nextTick()
    buildCharts()
  },
  { deep: true },
)

onMounted(async () => {
  await refresh()
})

onBeforeUnmount(() => {
  destroyCharts()
})
</script>

<style scoped>
.chart-wrap {
  min-height: 260px;
  position: relative;
}
.chart-wrap--doughnut {
  min-height: 280px;
}
.card-interactive {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
</style>
