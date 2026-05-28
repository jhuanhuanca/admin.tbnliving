<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Paquetes</h1>
        <p class="text-sm text-text-muted">
          Inscripción y pedidos tipo paquete. Monto comisionable opcional para BIR.
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost" type="button" :disabled="loading" @click="load">Actualizar</button>
        <button class="btn btn-primary" type="button" @click="openCreate">Nuevo paquete</button>
      </div>
    </div>

    <p v-if="error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{{ error }}</p>

    <Table
      title="Listado"
      :columns="columns"
      :rows="items"
      :loading="loading"
      :paginate="false"
      :clickable="false"
    >
      <template #cell:estado="{ row }">
        <span class="badge" :class="row.estado === 'activo' ? 'badge-success' : 'badge-danger'">{{ row.estado }}</span>
      </template>
      <template #cell:actions="{ row }">
        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" type="button" @click.stop="openEdit(row)">Editar</button>
          <button class="btn btn-danger btn-sm" type="button" @click.stop="askDeactivate(row)">Desactivar</button>
        </div>
      </template>
    </Table>

    <Modal :open="formOpen" :title="isEditing ? 'Editar paquete' : 'Nuevo paquete'" @close="closeForm">
      <form class="grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="guardar">
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Slug único (solo minúsculas y guiones)</label>
          <input v-model="form.slug" type="text" class="input mt-1" :disabled="isEditing" placeholder="fundador" required />
          <p v-if="isEditing" class="mt-1 text-xs text-text-muted">El slug no se edita en actualización.</p>
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Nombre visible</label>
          <input v-model="form.name" type="text" class="input mt-1" required />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Precio (BOB)</label>
          <input v-model="form.price" type="number" min="0" step="0.01" class="input mt-1" required />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">PV</label>
          <input v-model="form.pv_points" type="number" min="0" step="0.01" class="input mt-1" required />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Monto comisionable (opcional)</label>
          <input v-model="form.commissionable_amount" type="number" min="0" step="0.01" class="input mt-1" />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Estado</label>
          <select v-model="form.estado" class="input mt-1">
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
        <div class="md:col-span-2 flex justify-end gap-2">
          <button type="button" class="btn btn-ghost" @click="closeForm">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Guardando…' : isEditing ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </form>
    </Modal>

    <Modal :open="deleteOpen" title="Desactivar paquete" :subtitle="deleting?.name" @close="deleteOpen = false">
      <p class="text-sm text-text-muted">No aparecerá en inscripción ni catálogo público.</p>
      <div class="mt-4 flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" @click="deleteOpen = false">Cancelar</button>
        <button type="button" class="btn btn-danger" :disabled="saving" @click="confirmDeactivate">Desactivar</button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Table from '@/components/admin/Table.vue'
import Modal from '@/components/admin/Modal.vue'
import { adminService } from '@/services/api/adminService'
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const items = ref([])
const formOpen = ref(false)
const deleteOpen = ref(false)
const deleting = ref(null)

const form = reactive({
  id: null,
  slug: '',
  name: '',
  price: '',
  pv_points: '',
  commissionable_amount: '',
  estado: 'activo',
})

const isEditing = computed(() => form.id != null)

const columns = [
  { key: 'slug', label: 'Slug' },
  { key: 'name', label: 'Nombre' },
  { key: 'price', label: 'Precio' },
  { key: 'pv_points', label: 'PV' },
  { key: 'estado', label: 'Estado' },
  { key: 'actions', label: '' },
]

function resetForm() {
  Object.assign(form, {
    id: null,
    slug: '',
    name: '',
    price: '',
    pv_points: '',
    commissionable_amount: '',
    estado: 'activo',
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await adminService.listPackages()
    items.value = res.rows || []
  } catch {
    error.value = 'No se pudieron cargar los paquetes.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  formOpen.value = true
}

function openEdit(p) {
  Object.assign(form, {
    id: p.id,
    slug: p.slug ?? '',
    name: p.name ?? '',
    price: String(p.price ?? ''),
    pv_points: String(p.pv_points ?? ''),
    commissionable_amount: p.commissionable_amount != null ? String(p.commissionable_amount) : '',
    estado: p.estado ?? 'activo',
  })
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

async function guardar() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      slug: form.slug.trim().toLowerCase(),
      name: form.name.trim(),
      price: parseFloat(form.price),
      pv_points: parseFloat(form.pv_points),
      commissionable_amount: form.commissionable_amount ? parseFloat(form.commissionable_amount) : null,
      estado: form.estado,
    }
    if (isEditing.value) {
      await adminService.updatePackage(form.id, {
        name: payload.name,
        price: payload.price,
        pv_points: payload.pv_points,
        commissionable_amount: payload.commissionable_amount,
        estado: payload.estado,
      })
      ui.toast({ type: 'success', title: 'Paquete actualizado' })
    } else {
      await adminService.createPackage(payload)
      ui.toast({ type: 'success', title: 'Paquete creado' })
    }
    closeForm()
    resetForm()
    await load()
  } catch (e) {
    error.value = e?.response?.data?.message || 'Error al guardar (slug único, formato minúsculas).'
  } finally {
    saving.value = false
  }
}

function askDeactivate(p) {
  deleting.value = p
  deleteOpen.value = true
}

async function confirmDeactivate() {
  if (!deleting.value) return
  saving.value = true
  try {
    await adminService.deletePackage(deleting.value.id)
    ui.toast({ type: 'success', title: 'Paquete desactivado' })
    deleteOpen.value = false
    deleting.value = null
    await load()
  } catch {
    error.value = 'No se pudo desactivar.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
