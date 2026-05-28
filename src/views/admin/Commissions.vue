<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Comisiones</h1>
        <p class="text-sm text-text-muted">Binario, directo, matching. Filtros por fecha y totales.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="type" class="input w-[170px]" @change="apply">
          <option value="all">Todas</option>
          <option value="binario">Binario</option>
          <option value="directo">Directo</option>
          <option value="matching">Matching</option>
        </select>
        <input v-model="from" type="date" class="input w-[170px]" />
        <input v-model="to" type="date" class="input w-[170px]" />
        <button class="btn btn-primary" :disabled="admin.loading.commissions" @click="apply">Aplicar</button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="card lg:col-span-1">
        <div class="card-body">
          <p class="text-xs font-semibold text-text-muted">Total (filtro actual)</p>
          <p class="mt-2 text-2xl font-semibold text-text">{{ formatMoney(admin.commissions.totalAmount) }}</p>
          <p class="mt-1 text-xs text-text-muted">Suma de comisiones mostradas.</p>
        </div>
      </div>
      <div class="lg:col-span-2">
        <Table
          title="Historial"
          subtitle="Click para ver detalle (próximo)"
          :columns="columns"
          :rows="admin.commissions.rows"
          :loading="admin.loading.commissions"
          :paginate="false"
          @rowClick="rowClick"
        >
          <template #cell:type="{ row }">
            <span class="badge badge-info">{{ row.type }}</span>
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
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Table from '@/components/admin/Table.vue'
import { useAdminStore } from '@/stores/adminStore'
import { useUiStore } from '@/stores/uiStore'

const admin = useAdminStore()
const ui = useUiStore()

const type = ref(admin.commissions.filters.type)
const from = ref(admin.commissions.filters.from)
const to = ref(admin.commissions.filters.to)

const columns = [
  { key: 'user', label: 'Usuario' },
  { key: 'type', label: 'Tipo' },
  { key: 'amount', label: 'Monto' },
  { key: 'createdAt', label: 'Fecha' },
]

function formatMoney(v) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v)
}

async function apply() {
  await admin.fetchCommissions({ type: type.value, from: from.value, to: to.value })
}

function rowClick() {
  ui.toast({ type: 'info', title: 'Detalle', message: 'Mock: aquí irá el detalle de comisión.' })
}

onMounted(async () => {
  if (!admin.commissions.rows.length) await admin.fetchCommissions()
})
</script>