<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-text">Reconciliación y liderazgo</h1>
      <p class="text-sm text-text-muted">
        Cierres de periodo, agregados por tipo desde <code class="rounded bg-bg-2 px-1">commission_events</code> y bono
        liderazgo mensual.
      </p>
    </div>

    <div class="card">
      <div class="card-header">
        <p class="text-sm font-semibold text-text">Cierres de periodo</p>
        <p class="text-xs text-text-muted">Últimos registros (paginado)</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Tipo</th>
              <th class="px-4 py-3 font-semibold">Clave</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
              <th class="px-4 py-3 font-semibold">Alcance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingClosures">
              <td colspan="5" class="px-4 py-6 text-center text-text-muted">Cargando…</td>
            </tr>
            <tr v-for="c in closures" v-else :key="c.id" class="border-t border-border">
              <td class="px-4 py-3">{{ c.id }}</td>
              <td class="px-4 py-3">{{ c.period_type }}</td>
              <td class="px-4 py-3 font-mono text-xs">{{ c.period_key }}</td>
              <td class="px-4 py-3">{{ c.status }}</td>
              <td class="px-4 py-3">{{ c.scope }}</td>
            </tr>
            <tr v-if="!loadingClosures && !closures.length">
              <td colspan="5" class="px-4 py-6 text-center text-text-muted">Sin cierres.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header flex flex-wrap items-end gap-4">
        <div>
          <p class="text-sm font-semibold text-text">Resumen de comisiones</p>
          <p class="text-xs text-text-muted">Filtros opcionales por period_key / period_type</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <input v-model="periodKey" type="text" class="input w-36" placeholder="2026-03" />
          <input v-model="periodType" type="text" class="input w-36" placeholder="weekly / monthly" />
          <button type="button" class="btn btn-primary btn-sm" :disabled="loadingSummary" @click="cargarResumen">Aplicar</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <p v-if="errorSummary" class="px-4 py-2 text-sm text-danger">{{ errorSummary }}</p>
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">Tipo</th>
              <th class="px-4 py-3 font-semibold">period_key</th>
              <th class="px-4 py-3 font-semibold">period_type</th>
              <th class="px-4 py-3 font-semibold">Eventos</th>
              <th class="px-4 py-3 text-end font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingSummary">
              <td colspan="5" class="px-4 py-6 text-center text-text-muted">Cargando…</td>
            </tr>
            <tr v-for="(row, idx) in summary" v-else :key="idx" class="border-t border-border">
              <td class="px-4 py-3">{{ row.type }}</td>
              <td class="px-4 py-3 font-mono text-xs">{{ row.period_key }}</td>
              <td class="px-4 py-3">{{ row.period_type }}</td>
              <td class="px-4 py-3">{{ row.events_count }}</td>
              <td class="px-4 py-3 text-end font-semibold">{{ row.total_amount }}</td>
            </tr>
            <tr v-if="!loadingSummary && !summary.length">
              <td colspan="5" class="px-4 py-6 text-center text-text-muted">Sin filas para los filtros.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <p class="text-sm font-semibold text-text">Bono liderazgo</p>
        <p class="text-xs text-text-muted">Mes (YYYY-MM)</p>
      </div>
      <div class="card-body space-y-3">
        <div class="flex flex-wrap gap-2">
          <input v-model="leadershipMonth" type="text" class="input w-40" placeholder="2026-05" />
          <button type="button" class="btn btn-ghost btn-sm" @click="cargarLiderazgo">Cargar</button>
        </div>
        <div v-if="leadership" class="text-sm text-text-muted">
          <p>
            Total: <strong class="text-text">{{ leadership.total_amount }}</strong> — Eventos:
            {{ leadership.events_count }}
          </p>
          <ul class="mt-2 max-h-64 list-inside list-disc space-y-1 overflow-y-auto text-xs">
            <li v-for="(b, i) in leadership.by_beneficiary" :key="i">
              Usuario {{ b.user_id }}: {{ b.total }} ({{ b.events }} evt.)
            </li>
          </ul>
        </div>
        <p v-else class="text-sm text-text-muted">Sin datos de liderazgo para el mes indicado.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { adminService } from '@/services/api/adminService'

const closures = ref([])
const loadingClosures = ref(false)

const periodKey = ref('')
const periodType = ref('')
const summary = ref([])
const loadingSummary = ref(false)
const errorSummary = ref('')

const leadershipMonth = ref('')
const leadership = ref(null)

async function loadClosures() {
  loadingClosures.value = true
  try {
    const { rows } = await adminService.listPeriodClosures({ per_page: 30 })
    closures.value = rows || []
  } catch {
    closures.value = []
  } finally {
    loadingClosures.value = false
  }
}

async function cargarResumen() {
  loadingSummary.value = true
  errorSummary.value = ''
  try {
    summary.value = await adminService.listCommissionSummary({
      period_key: periodKey.value || undefined,
      period_type: periodType.value || undefined,
    })
  } catch {
    errorSummary.value = 'Error al cargar el resumen de comisiones.'
    summary.value = []
  } finally {
    loadingSummary.value = false
  }
}

async function cargarLiderazgo() {
  if (!leadershipMonth.value || !/^\d{4}-\d{2}$/.test(leadershipMonth.value)) {
    leadership.value = null
    return
  }
  try {
    leadership.value = await adminService.getLeadershipMonth(leadershipMonth.value)
  } catch {
    leadership.value = null
  }
}

onMounted(async () => {
  const d = new Date()
  periodKey.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  leadershipMonth.value = periodKey.value
  await loadClosures()
  await cargarResumen()
  await cargarLiderazgo()
})
</script>
