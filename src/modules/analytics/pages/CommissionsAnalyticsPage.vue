<template>
  <div class="space-y-6">
    <div class="card">
      <div class="card-body flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text">Commissions Analytics</h1>
          <p class="text-sm text-text-muted">Resumen por periodo (commission_summaries).</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost" :disabled="loading" @click="load">Actualizar</button>
        </div>
      </div>
    </div>

    <EnterpriseDataTable
      title="Resumen comisiones"
      subtitle="period_type / period_key"
      :columns="cols"
      :fetcher="fetcher"
      :page-size="20"
      :searchable="false"
      row-key-field="id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EnterpriseDataTable from '../components/EnterpriseDataTable.vue'
import { analyticsService } from '../services/analytics.service'
import { useAnalyticsStore } from '../stores/analyticsStore'

const a = useAnalyticsStore()
const loading = ref(false)
const rows = ref<any[]>([])

const cols = [
  { key: 'commission_type', label: 'Tipo' },
  { key: 'amount_total', label: 'Total', align: 'end' },
  { key: 'events_count', label: 'Eventos', align: 'end' },
]

async function load() {
  loading.value = true
  try {
    const res = await analyticsService.getCommissionMetrics({
      ...a.buildParams(),
      period_type: 'daily',
      period_key: new Date().toISOString().slice(0, 10),
    } as any)
    rows.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function fetcher() {
  if (!rows.value.length) await load()
  return { rows: rows.value }
}
</script>

