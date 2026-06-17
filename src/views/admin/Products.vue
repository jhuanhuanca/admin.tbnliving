<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Productos del catálogo</h1>
        <p class="text-sm text-text-muted">
          Socios ven solo productos <strong>activos</strong>. PV alimenta pedidos y calificación mensual.
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost" type="button" :disabled="loading" @click="load">Actualizar</button>
        <button class="btn btn-primary" type="button" @click="openCreate">Nuevo producto</button>
      </div>
    </div>

    <p v-if="error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{{ error }}</p>

    <Table
      title="Catálogo"
      subtitle="Precio socio (BOB), PV, categoría y estado"
      :columns="columns"
      :rows="items"
      :loading="loading"
      :paginate="false"
      :clickable="false"
    >
      <template #cell:category="{ row }">
        <span class="text-text-muted">{{ row.category?.name || '—' }}</span>
      </template>
      <template #cell:price="{ row }">
        <span class="font-semibold text-text">{{ formatBs(row.price) }}</span>
      </template>
      <template #cell:pv_points="{ row }">
        <span>{{ row.pv_points }}</span>
      </template>
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

    <Modal :open="formOpen" :title="isEditing ? 'Editar producto' : 'Nuevo producto'" @close="closeForm">
      <form class="grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="guardar">
        <p v-if="error" class="md:col-span-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{{ error }}</p>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Nombre</label>
          <input v-model="form.name" type="text" class="input mt-1" required />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Precio socio (BOB)</label>
          <input v-model="form.price" type="number" min="0" step="0.01" class="input mt-1" required />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Cliente preferente (opc.)</label>
          <input v-model="form.price_cliente_preferente" type="number" min="0" step="0.01" class="input mt-1" placeholder="Auto +12%" />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">PV</label>
          <input v-model="form.pv_points" type="number" min="0" step="0.01" class="input mt-1" required />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Stock</label>
          <input v-model.number="form.stock" type="number" min="0" class="input mt-1" />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Categoría</label>
          <select v-model="form.category_id" class="input mt-1">
            <option value="">— Sin categoría —</option>
            <option v-for="c in categories" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Estado</label>
          <select v-model="form.estado" class="input mt-1">
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Descripción</label>
          <textarea v-model="form.description" class="input mt-1 min-h-[72px]" rows="2" />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Imagen del producto</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="input mt-1"
            @change="onImageSelected"
          />
          <p class="mt-1 text-xs text-text-muted">JPG, PNG, WEBP o GIF. Máx. 5 MB. Si subes archivo, tiene prioridad sobre la URL legacy.</p>
          <img
            v-if="imagePreview"
            :src="imagePreview"
            alt="Vista previa"
            class="mt-2 max-h-32 rounded-lg border border-border object-contain"
          />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">URL imagen legacy (opcional)</label>
          <input v-model="form.image_url" type="text" class="input mt-1" placeholder="https://..." />
          <p class="mt-1 text-xs text-text-muted">Solo se usa si no hay imagen subida al servidor.</p>
        </div>
        <div class="md:col-span-2 flex justify-end gap-2">
          <button type="button" class="btn btn-ghost" @click="closeForm">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Guardando…' : isEditing ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </form>
    </Modal>

    <Modal :open="deleteOpen" title="Desactivar producto" :subtitle="deleting?.name" @close="deleteOpen = false">
      <p class="text-sm text-text-muted">El producto pasará a inactivo en catálogo.</p>
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
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import { useAdminStore } from '@/stores/adminStore'
import { useUiStore } from '@/stores/uiStore'

const admin = useAdminStore()
const ui = useUiStore()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const items = ref([])
const categories = ref([])

const formOpen = ref(false)
const deleteOpen = ref(false)
const deleting = ref(null)
const imageFile = ref(null)
const imagePreview = ref('')

const form = reactive({
  id: null,
  name: '',
  description: '',
  price: '',
  price_cliente_preferente: '',
  stock: 0,
  image_url: '',
  category_id: '',
  pv_points: '',
  estado: 'activo',
})

const isEditing = computed(() => form.id != null)

const columns = [
  { key: 'name', label: 'Producto' },
  { key: 'category', label: 'Categoría' },
  { key: 'price', label: 'Precio' },
  { key: 'pv_points', label: 'PV' },
  { key: 'estado', label: 'Estado' },
  { key: 'actions', label: '' },
]

function formatBs(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(n)
}

function resetForm() {
  imageFile.value = null
  imagePreview.value = ''
  Object.assign(form, {
    id: null,
    name: '',
    description: '',
    price: '',
    price_cliente_preferente: '',
    stock: 0,
    image_url: '',
    category_id: '',
    pv_points: '',
    estado: 'activo',
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [cats, prods] = await Promise.all([adminService.listCategories(), adminService.listProducts()])
    categories.value = Array.isArray(cats) ? cats : []
    items.value = prods.rows || []
  } catch {
    error.value = 'No se pudieron cargar productos o categorías.'
  } finally {
    loading.value = false
  }
}

function onImageSelected(event) {
  const file = event.target.files?.[0] ?? null
  if (file && file.size > 5 * 1024 * 1024) {
    error.value = 'La imagen no puede superar 5 MB.'
    event.target.value = ''
    imageFile.value = null
    return
  }
  imageFile.value = file
  if (file) {
    imagePreview.value = URL.createObjectURL(file)
  } else if (!form.image_url_resolved) {
    imagePreview.value = ''
  }
}

function openCreate() {
  resetForm()
  error.value = ''
  formOpen.value = true
}

function openEdit(p) {
  imageFile.value = null
  error.value = ''
  Object.assign(form, {
    id: p.id,
    name: p.name ?? '',
    description: p.description ?? '',
    price: String(p.price ?? ''),
    price_cliente_preferente:
      p.price_cliente_preferente != null && p.price_cliente_preferente !== '' ? String(p.price_cliente_preferente) : '',
    stock: p.stock ?? 0,
    image_url: p.image_url ?? '',
    image_url_resolved: p.image_url_resolved ?? '',
    category_id: p.category_id ? String(p.category_id) : '',
    pv_points: String(p.pv_points ?? ''),
    estado: p.estado ?? 'activo',
  })
  imagePreview.value = p.image_url_resolved || p.image_admin_url || p.image_url || ''
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

async function guardar() {
  saving.value = true
  error.value = ''
  try {
    const price = parseFloat(form.price)
    const pv = parseFloat(form.pv_points)
    if (Number.isNaN(price) || price < 0) {
      error.value = 'Ingresa un precio válido.'
      return
    }
    if (Number.isNaN(pv) || pv < 0) {
      error.value = 'Ingresa PV válido.'
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      price,
      stock: parseInt(String(form.stock), 10) || 0,
      image_url: form.image_url?.trim() || null,
      category_id: form.category_id ? parseInt(form.category_id, 10) : null,
      pv_points: pv,
      estado: form.estado,
    }
    const pcp = form.price_cliente_preferente
    if (pcp !== '' && pcp != null && !Number.isNaN(parseFloat(String(pcp)))) {
      payload.price_cliente_preferente = parseFloat(String(pcp))
    }
    if (isEditing.value) {
      await admin.updateProduct(form.id, payload, imageFile.value)
      ui.toast({ type: 'success', title: 'Producto actualizado' })
    } else {
      await admin.createProduct(payload, imageFile.value)
      ui.toast({ type: 'success', title: 'Producto creado' })
    }
    closeForm()
    resetForm()
    await load()
  } catch (e) {
    error.value = apiErrorMessage(e, 'Error al guardar.')
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
    await admin.deleteProduct(deleting.value.id)
    ui.toast({ type: 'success', title: 'Producto desactivado' })
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
