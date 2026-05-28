<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Usuarios</h1>
        <p class="text-sm text-text-muted">Búsqueda, filtros, paginación y perfil.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <input v-model="q" class="input w-[260px]" placeholder="Buscar por nombre o email..." @keyup.enter="applyFilters" />
        <select v-model="status" class="input w-[160px]" @change="applyFilters">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <button class="btn btn-ghost" @click="reset" :disabled="admin.loading.users">Reset</button>
        <button class="btn btn-primary" @click="applyFilters" :disabled="admin.loading.users">Buscar</button>
      </div>
    </div>

    <Table
      title="Listado"
      subtitle="Click en una fila para ver perfil"
      :columns="columns"
      :rows="admin.users.rows"
      :loading="admin.loading.users"
      :page="admin.users.page"
      :page-size="admin.users.pageSize"
      :total="admin.users.total"
      @rowClick="openProfile"
      @update:page="onPage"
    >
      <template #cell:name="{ row }">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10" />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-text">{{ row.name }}</p>
            <p class="truncate text-xs text-text-muted">ID: {{ row.id }}</p>
          </div>
        </div>
      </template>

      <template #cell:email="{ row }">
        <span class="text-text-muted">{{ row.email }}</span>
      </template>

      <template #cell:rank="{ row }">
        <span class="badge badge-info">{{ row.rank }}</span>
      </template>

      <template #cell:active="{ row }">
        <span class="badge" :class="row.active ? 'badge-success' : 'badge-danger'">
          {{ row.active ? 'Activo' : 'Inactivo' }}
        </span>
      </template>

      <template #cell:monthlyActive="{ row }">
        <span class="badge" :class="row.monthlyActive ? 'badge-success' : 'badge-warn'">
          {{ row.monthlyActive ? 'Sí' : 'No' }}
        </span>
      </template>
    </Table>

    <Modal
      :open="profileOpen"
      title="Perfil de usuario"
      :subtitle="selected ? `${selected.name} · ${selected.email}` : ''"
      @close="profileOpen = false"
    >
      <div v-if="!selected" class="text-sm text-text-muted">Sin selección</div>
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="card">
          <div class="card-body space-y-2">
            <p class="text-xs font-semibold text-text-muted">Estado</p>
            <p>
              <span class="badge" :class="selected.active ? 'badge-success' : 'badge-danger'">
                {{ selected.active ? 'Activo' : 'Inactivo' }}
              </span>
            </p>
            <p class="text-xs font-semibold text-text-muted">Rango</p>
            <p><span class="badge badge-info">{{ selected.rank }}</span></p>
            <p class="text-xs font-semibold text-text-muted">Activación mensual</p>
            <p>
              <span class="badge" :class="selected.monthlyActive ? 'badge-success' : 'badge-warn'">
                {{ selected.monthlyActive ? 'Activa' : 'No activa' }}
              </span>
            </p>
          </div>
        </div>

        <div class="card">
          <div class="card-body space-y-2">
            <p class="text-xs font-semibold text-text-muted">Volumen binario</p>
            <div class="flex items-center justify-between">
              <p class="text-sm text-text-muted">Left</p>
              <p class="text-sm font-semibold text-text">{{ formatNumber(selected.binaryLeft) }}</p>
            </div>
            <div class="flex items-center justify-between">
              <p class="text-sm text-text-muted">Right</p>
              <p class="text-sm font-semibold text-text">{{ formatNumber(selected.binaryRight) }}</p>
            </div>
            <div class="mt-2 rounded-xl border border-border bg-bg-2 p-3">
              <p class="text-xs text-text-muted">Creado</p>
              <p class="text-sm font-semibold text-text">{{ selected.createdAt }}</p>
            </div>
          </div>
        </div>

        <div class="md:col-span-2 flex items-center justify-end gap-2">
          <button class="btn btn-ghost" @click="profileOpen = false">Cerrar</button>
          <button class="btn btn-primary" @click="notify">Acción (mock)</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Table from '@/components/admin/Table.vue'
import Modal from '@/components/admin/Modal.vue'
import { useAdminStore } from '@/stores/adminStore'
import { useUiStore } from '@/stores/uiStore'

const admin = useAdminStore()
const ui = useUiStore()

const q = ref(admin.users.q)
const status = ref(admin.users.status)

const columns = [
  { key: 'name', label: 'Usuario' },
  { key: 'email', label: 'Email' },
  { key: 'rank', label: 'Rango' },
  { key: 'monthlyActive', label: 'Act. mensual' },
  { key: 'active', label: 'Estado' },
]

const profileOpen = ref(false)
const selected = ref(null)

function openProfile(row) {
  selected.value = row
  profileOpen.value = true
}

async function applyFilters() {
  await admin.fetchUsers({ q: q.value, status: status.value, page: 1 })
}

async function onPage(nextPage) {
  await admin.fetchUsers({ page: nextPage })
}

async function reset() {
  q.value = ''
  status.value = 'all'
  await admin.fetchUsers({ q: '', status: 'all', page: 1 })
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-ES').format(value)
}

function notify() {
  ui.toast({ type: 'info', title: 'Acción', message: 'Mock: listo para conectar acciones reales a Laravel.' })
}

onMounted(async () => {
  if (!admin.users.rows.length) await admin.fetchUsers()
})
</script>