<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-text">Wallet</h1>
        <p class="text-sm text-text-muted">Balance, ingresos/egresos e historial financiero.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost" :disabled="admin.loading.wallet" @click="refresh">Actualizar</button>
        <button class="btn btn-primary" type="button" :disabled="admin.loading.wallet || !admin.wallet" @click="printReport">
          Imprimir reporte
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <KPIBox title="Balance" :value="admin.wallet?.balance ?? 0" format="currency" currency="USD" hint="Actual" />
      <KPIBox title="Ingresos" :value="admin.wallet?.income ?? 0" format="currency" currency="USD" hint="Periodo" />
      <KPIBox title="Egresos" :value="admin.wallet?.expense ?? 0" format="currency" currency="USD" hint="Periodo" />
    </div>

    <Table
      title="Movimientos"
      subtitle="Historial financiero"
      :columns="columns"
      :rows="admin.wallet?.movements ?? []"
      :loading="admin.loading.wallet"
      :paginate="false"
    >
      <template #cell:kind="{ row }">
        <span class="badge" :class="row.kind === 'income' ? 'badge-success' : 'badge-danger'">
          {{ row.kind === 'income' ? 'Ingreso' : 'Egreso' }}
        </span>
      </template>
      <template #cell:amount="{ row }">
        <span class="font-semibold" :class="row.amount >= 0 ? 'text-success' : 'text-danger'">
          {{ formatMoney(row.amount) }}
        </span>
      </template>
      <template #cell:createdAt="{ row }">
        <span class="text-text-muted">{{ row.createdAt }}</span>
      </template>
    </Table>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import KPIBox from '@/components/admin/KPIBox.vue'
import Table from '@/components/admin/Table.vue'
import { useAdminStore } from '@/stores/adminStore'

const admin = useAdminStore()

const columns = [
  { key: 'kind', label: 'Tipo' },
  { key: 'concept', label: 'Concepto' },
  { key: 'amount', label: 'Monto' },
  { key: 'createdAt', label: 'Fecha' },
]

function formatMoney(v) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v)
}

async function refresh() {
  await admin.fetchWallet()
}

function buildHtmlReport() {
  const w = admin.wallet
  const rows = w?.movements ?? []
  const fmt = (v) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(Number(v) || 0)
  const esc = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  return `<!DOCTYPE html>
  <html lang="es"><head><meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reporte Wallet</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;margin:24px;color:#0f172a}
    h1{margin:0 0 6px}
    .muted{color:#64748b;font-size:12px;margin:0 0 16px}
    .kpi{display:flex;gap:12px;margin:12px 0 18px}
    .box{border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;min-width:180px}
    .label{color:#64748b;font-size:12px}
    .value{font-weight:800;font-size:16px}
    table{width:100%;border-collapse:collapse}
    th,td{border-bottom:1px solid #e2e8f0;padding:10px 8px;font-size:13px;vertical-align:top}
    th{color:#64748b;text-transform:uppercase;letter-spacing:.06em;font-size:11px;text-align:left}
    .num{text-align:right;white-space:nowrap}
  </style></head><body>
  <h1>Reporte Wallet</h1>
  <p class="muted">Generado: ${new Date().toLocaleString('es-BO')}</p>
  <div class="kpi">
    <div class="box"><div class="label">Balance</div><div class="value">${fmt(w?.balance ?? 0)}</div></div>
    <div class="box"><div class="label">Ingresos</div><div class="value">${fmt(w?.income ?? 0)}</div></div>
    <div class="box"><div class="label">Egresos</div><div class="value">${fmt(w?.expense ?? 0)}</div></div>
  </div>
  <table><thead><tr>
    <th>Tipo</th><th>Concepto</th><th class="num">Monto</th><th>Usuario</th><th>Fecha</th>
  </tr></thead><tbody>
    ${rows
      .map(
        (r) => `<tr>
          <td>${esc(r.kind === 'income' ? 'Ingreso' : 'Egreso')}</td>
          <td>${esc(r.concept)}</td>
          <td class="num">${fmt(r.amount)}</td>
          <td>${esc(r.user)} ${r.member_code ? `(${esc(r.member_code)})` : ''}</td>
          <td>${esc(r.createdAt)}</td>
        </tr>`,
      )
      .join('')}
  </tbody></table>
  <p class="muted">Para PDF: Imprimir → Guardar como PDF.</p>
  </body></html>`
}

function printReport() {
  const html = buildHtmlReport()
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) return
  w.document.open()
  w.document.write(html)
  w.document.close()
  setTimeout(() => {
    try {
      w.focus()
      w.print()
    } catch {
      // ignore
    }
  }, 250)
}

onMounted(async () => {
  if (!admin.wallet) await admin.fetchWallet()
})
</script>

