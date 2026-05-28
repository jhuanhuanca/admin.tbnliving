<template>
  <div class="space-y-6">
    <div class="card">
      <div class="card-body flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-text">Products Analytics</h1>
          <p class="text-sm text-text-muted">Top productos (RAW → snapshots).</p>
        </div>
        <button class="btn btn-ghost" :disabled="a.loading.products === 'loading'" @click="a.fetchProducts(true)">Actualizar</button>
      </div>
    </div>

    <EnterpriseDataTable
      title="Top productos"
      subtitle="product_sales_metrics (agregado por día/país)"
      :columns="cols"
      :fetcher="fetchTop"
      :page-size="20"
      :searchable="false"
      row-key-field="product_id"
    >
      <template #cell:product_id="{ value }">
        <span class="badge badge-info">#{{ value }}</span>
      </template>
      <template #cell:sales_total="{ value }">
        <span class="font-semibold text-text">{{ money(value) }}</span>
      </template>
    </EnterpriseDataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAnalyticsStore } from '../stores/analyticsStore'
import EnterpriseDataTable from '../components/EnterpriseDataTable.vue'

const a = useAnalyticsStore()
onMounted(() => {
  if (!a.topProducts.length) a.fetchProducts()
})

const cols = [
  { key: 'product_id', label: 'Producto' },
  { key: 'sales_total', label: 'Ventas', align: 'end', sortable: true },
  { key: 'qty', label: 'Qty', align: 'end', sortable: true },
  { key: 'pv_total', label: 'PV', align: 'end', sortable: true },
]

async function fetchTop() {
  return { rows: a.topProducts }
}

function money(v: any) {
  const n = Number(v || 0)
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(n)
}
</script>

