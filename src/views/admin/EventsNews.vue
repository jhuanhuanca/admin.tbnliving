<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Eventos y noticias</h1>
        <p class="text-sm text-text-muted">
          Publica eventos virtuales (YouTube / Zoom) o presenciales con flyer. Gestiona noticias e inscripciones con pago.
        </p>
      </div>
      <button class="btn btn-ghost" type="button" :disabled="loading" @click="loadAll">Actualizar</button>
    </div>

    <div class="flex flex-wrap gap-2 border-b border-border pb-2">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="btn btn-sm"
        :class="tab === t.id ? 'btn-primary' : 'btn-ghost'"
        @click="tab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <p v-if="error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{{ error }}</p>

    <!-- Eventos -->
    <template v-if="tab === 'events'">
      <div class="flex justify-end">
        <button type="button" class="btn btn-primary btn-sm" @click="openEventCreate">Nuevo evento</button>
      </div>
      <div class="card overflow-hidden">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3">Nombre</th>
              <th class="px-4 py-3">Tipo</th>
              <th class="px-4 py-3">Horario</th>
              <th class="px-4 py-3">Entrada</th>
              <th class="px-4 py-3">Flyer</th>
              <th class="px-4 py-3 text-end">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ev in events" :key="ev.id" class="border-t border-border">
              <td class="px-4 py-3 font-medium">{{ ev.name }}</td>
              <td class="px-4 py-3">{{ eventKindLabel(ev) }}</td>
              <td class="px-4 py-3 text-text-muted">{{ formatRange(ev.starts_at, ev.ends_at) }}</td>
              <td class="px-4 py-3">{{ formatBs(ev.entry_cost) }}</td>
              <td class="px-4 py-3">
                <a v-if="ev.flyer_admin_url" :href="ev.flyer_admin_url" target="_blank" class="text-brand text-xs">Ver</a>
                <span v-else class="text-xs text-text-muted">—</span>
              </td>
              <td class="px-4 py-3 text-end">
                <button type="button" class="btn btn-ghost btn-sm" @click="openEventEdit(ev)">Editar</button>
                <button type="button" class="btn btn-danger btn-sm" @click="deactivateEvent(ev)">Desactivar</button>
              </td>
            </tr>
            <tr v-if="!events.length">
              <td colspan="6" class="px-4 py-8 text-center text-text-muted">Sin eventos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Noticias -->
    <template v-else-if="tab === 'news'">
      <div class="flex justify-end">
        <button type="button" class="btn btn-primary btn-sm" @click="openNewsCreate">Nueva noticia</button>
      </div>
      <div class="card overflow-hidden">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3">Título</th>
              <th class="px-4 py-3">Publicación</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3 text-end">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in newsRows" :key="n.id" class="border-t border-border">
              <td class="px-4 py-3 font-medium">{{ n.title }}</td>
              <td class="px-4 py-3 text-text-muted">{{ formatDate(n.published_at) }}</td>
              <td class="px-4 py-3">{{ n.estado }}</td>
              <td class="px-4 py-3 text-end">
                <button type="button" class="btn btn-ghost btn-sm" @click="openNewsEdit(n)">Editar</button>
                <button type="button" class="btn btn-danger btn-sm" @click="deactivateNews(n)">Desactivar</button>
              </td>
            </tr>
            <tr v-if="!newsRows.length">
              <td colspan="4" class="px-4 py-8 text-center text-text-muted">Sin noticias.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Inscripciones -->
    <template v-else>
      <div class="flex items-center gap-2">
        <select v-model="regEstado" class="input w-auto py-1 text-sm" @change="loadRegistrations">
          <option value="pendiente_pago">Pendientes de pago</option>
          <option value="completado">Completados</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>
      <div class="card overflow-hidden">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">Socio</th>
              <th class="px-4 py-3">Evento</th>
              <th class="px-4 py-3">Total</th>
              <th class="px-4 py-3">Comprobante</th>
              <th class="px-4 py-3 text-end">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in registrations" :key="r.id" class="border-t border-border">
              <td class="px-4 py-3">{{ r.id }}</td>
              <td class="px-4 py-3">{{ r.user?.name }} <span class="text-text-muted text-xs">({{ r.user?.member_code }})</span></td>
              <td class="px-4 py-3">{{ r.event?.name }}</td>
              <td class="px-4 py-3 font-semibold">{{ formatBs(r.total) }}</td>
              <td class="px-4 py-3">
                <button v-if="r.has_payment_proof" type="button" class="btn btn-ghost btn-sm" @click="viewRegProof(r)">Ver</button>
                <span v-else class="text-xs text-text-muted">—</span>
              </td>
              <td class="px-4 py-3 text-end">
                <button
                  v-if="r.estado === 'pendiente_pago'"
                  type="button"
                  class="btn btn-primary btn-sm"
                  :disabled="regBusy === r.id"
                  @click="confirmReg(r)"
                >
                  Confirmar pago
                </button>
              </td>
            </tr>
            <tr v-if="!registrations.length">
              <td colspan="6" class="px-4 py-8 text-center text-text-muted">Sin inscripciones.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <Modal :open="eventFormOpen" :title="eventEditing ? 'Editar evento' : 'Nuevo evento'" @close="eventFormOpen = false">
      <form class="grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="saveEvent">
        <div>
          <label class="text-xs font-semibold text-text-muted">Tipo</label>
          <select v-model="eventForm.kind" class="input mt-1" required>
            <option value="virtual">Virtual</option>
            <option value="presencial">Presencial</option>
          </select>
        </div>
        <div v-if="eventForm.kind === 'virtual'">
          <label class="text-xs font-semibold text-text-muted">Plataforma</label>
          <select v-model="eventForm.platform" class="input mt-1" required>
            <option value="youtube">YouTube</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Nombre</label>
          <input v-model="eventForm.name" class="input mt-1" required />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Descripción</label>
          <textarea v-model="eventForm.description" class="input mt-1 min-h-[60px]" rows="2" />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Orador / presentador</label>
          <input v-model="eventForm.speaker" class="input mt-1" />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Inicio</label>
          <input v-model="eventForm.starts_at" type="datetime-local" class="input mt-1" required />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Fin</label>
          <input v-model="eventForm.ends_at" type="datetime-local" class="input mt-1" required />
        </div>
        <div v-if="eventForm.kind === 'virtual'" class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Enlace (YouTube / Zoom)</label>
          <input v-model="eventForm.virtual_url" type="url" class="input mt-1" />
        </div>
        <div v-if="eventForm.kind === 'presencial'" class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Dirección</label>
          <input v-model="eventForm.address" class="input mt-1" />
        </div>
        <div v-if="eventForm.kind === 'presencial'">
          <label class="text-xs font-semibold text-text-muted">Costo entrada (Bs.)</label>
          <input v-model="eventForm.entry_cost" type="number" min="0" step="0.01" class="input mt-1" />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Estado</label>
          <select v-model="eventForm.estado" class="input mt-1">
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Detalle del evento</label>
          <textarea v-model="eventForm.details" class="input mt-1 min-h-[72px]" rows="3" />
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-text-muted">Flyer (imagen)</label>
          <input type="file" accept="image/*" class="input mt-1" @change="onFlyerPick" />
        </div>
        <div class="md:col-span-2 flex justify-end gap-2">
          <button type="button" class="btn btn-ghost" @click="eventFormOpen = false">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
        </div>
      </form>
    </Modal>

    <Modal :open="newsFormOpen" :title="newsEditing ? 'Editar noticia' : 'Nueva noticia'" @close="newsFormOpen = false">
      <form class="space-y-4" @submit.prevent="saveNews">
        <div>
          <label class="text-xs font-semibold text-text-muted">Título</label>
          <input v-model="newsForm.title" class="input mt-1" required />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Resumen</label>
          <input v-model="newsForm.summary" class="input mt-1" />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Cuerpo</label>
          <textarea v-model="newsForm.body" class="input mt-1 min-h-[100px]" rows="4" />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Publicación</label>
          <input v-model="newsForm.published_at" type="datetime-local" class="input mt-1" />
        </div>
        <div>
          <label class="text-xs font-semibold text-text-muted">Imagen</label>
          <input type="file" accept="image/*" class="input mt-1" @change="onNewsImagePick" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn btn-ghost" @click="newsFormOpen = false">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
        </div>
      </form>
    </Modal>

    <Modal :open="proofOpen" title="Comprobante de inscripción" @close="closeProof">
      <div v-if="proofUrl">
        <img v-if="proofMime.startsWith('image/')" :src="proofUrl" class="max-h-[70vh] w-full object-contain rounded-xl" alt="" />
        <iframe v-else-if="proofMime === 'application/pdf'" :src="proofUrl" class="h-[70vh] w-full rounded-xl border border-border" />
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import Modal from '@/components/admin/Modal.vue'
import { adminService } from '@/services/api/adminService'
import { useUiStore } from '@/stores/uiStore'
import { formatBob } from '@/utils/money'

const ui = useUiStore()

const tabs = [
  { id: 'events', label: 'Eventos' },
  { id: 'news', label: 'Noticias' },
  { id: 'regs', label: 'Inscripciones' },
]

const tab = ref('events')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const events = ref([])
const newsRows = ref([])
const registrations = ref([])
const regEstado = ref('pendiente_pago')
const regBusy = ref(null)

const eventFormOpen = ref(false)
const eventEditing = ref(null)
const eventForm = reactive(emptyEventForm())
const flyerFile = ref(null)

const newsFormOpen = ref(false)
const newsEditing = ref(null)
const newsForm = reactive(emptyNewsForm())
const newsImageFile = ref(null)

const proofOpen = ref(false)
const proofUrl = ref('')
const proofMime = ref('')

function emptyEventForm() {
  return {
    kind: 'virtual',
    platform: 'youtube',
    name: '',
    description: '',
    speaker: '',
    starts_at: '',
    ends_at: '',
    virtual_url: '',
    address: '',
    entry_cost: '0',
    details: '',
    estado: 'activo',
  }
}

function emptyNewsForm() {
  return {
    title: '',
    summary: '',
    body: '',
    published_at: '',
    estado: 'activo',
  }
}

function formatBs(v) {
  return formatBob(v)
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-BO')
  } catch {
    return iso
  }
}

function formatRange(start, end) {
  return `${formatDate(start)} → ${formatDate(end)}`
}

function eventKindLabel(ev) {
  if (ev.kind === 'virtual') {
    return ev.platform === 'zoom' ? 'Virtual · Zoom' : 'Virtual · YouTube'
  }
  return 'Presencial'
}

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const [ev, nw] = await Promise.all([adminService.listEvents(), adminService.listNews()])
    events.value = ev.rows || []
    newsRows.value = nw.rows || []
    if (tab.value === 'regs') await loadRegistrations()
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo cargar datos.'
  } finally {
    loading.value = false
  }
}

async function loadRegistrations() {
  try {
    const { rows } = await adminService.listEventRegistrations({ estado: regEstado.value })
    registrations.value = rows || []
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudieron cargar inscripciones.'
  }
}

function openEventCreate() {
  eventEditing.value = null
  Object.assign(eventForm, emptyEventForm())
  flyerFile.value = null
  eventFormOpen.value = true
}

function openEventEdit(ev) {
  eventEditing.value = ev
  Object.assign(eventForm, {
    kind: ev.kind,
    platform: ev.platform || 'youtube',
    name: ev.name,
    description: ev.description || '',
    speaker: ev.speaker || '',
    starts_at: toLocalInput(ev.starts_at),
    ends_at: toLocalInput(ev.ends_at),
    virtual_url: ev.virtual_url || '',
    address: ev.address || '',
    entry_cost: String(ev.entry_cost ?? 0),
    details: ev.details || '',
    estado: ev.estado || 'activo',
  })
  flyerFile.value = null
  eventFormOpen.value = true
}

function onFlyerPick(e) {
  flyerFile.value = e.target?.files?.[0] || null
}

function onNewsImagePick(e) {
  newsImageFile.value = e.target?.files?.[0] || null
}

async function saveEvent() {
  saving.value = true
  error.value = ''
  const payload = { ...eventForm }
  try {
    if (eventEditing.value) {
      await adminService.updateEvent(eventEditing.value.id, payload, flyerFile.value)
    } else {
      await adminService.createEvent(payload, flyerFile.value)
    }
    eventFormOpen.value = false
    ui.toast({ type: 'success', title: 'Evento guardado' })
    await loadAll()
  } catch (e) {
    error.value = e?.response?.data?.message || 'Error al guardar evento.'
  } finally {
    saving.value = false
  }
}

async function deactivateEvent(ev) {
  if (!confirm(`¿Desactivar "${ev.name}"?`)) return
  await adminService.deactivateEvent(ev.id)
  await loadAll()
}

function openNewsCreate() {
  newsEditing.value = null
  Object.assign(newsForm, emptyNewsForm())
  newsImageFile.value = null
  newsFormOpen.value = true
}

function openNewsEdit(n) {
  newsEditing.value = n
  Object.assign(newsForm, {
    title: n.title,
    summary: n.summary || '',
    body: n.body || '',
    published_at: toLocalInput(n.published_at),
    estado: n.estado || 'activo',
  })
  newsImageFile.value = null
  newsFormOpen.value = true
}

async function saveNews() {
  saving.value = true
  try {
    if (newsEditing.value) {
      await adminService.updateNews(newsEditing.value.id, { ...newsForm }, newsImageFile.value)
    } else {
      await adminService.createNews({ ...newsForm }, newsImageFile.value)
    }
    newsFormOpen.value = false
    ui.toast({ type: 'success', title: 'Noticia guardada' })
    await loadAll()
  } catch (e) {
    error.value = e?.response?.data?.message || 'Error al guardar noticia.'
  } finally {
    saving.value = false
  }
}

async function deactivateNews(n) {
  if (!confirm(`¿Desactivar "${n.title}"?`)) return
  await adminService.deactivateNews(n.id)
  await loadAll()
}

async function confirmReg(r) {
  regBusy.value = r.id
  try {
    await adminService.confirmEventRegistration(r.id, { payment_method: r.payment_method || 'efectivo' })
    ui.toast({ type: 'success', title: 'Inscripción confirmada', message: `#${r.id}` })
    await loadRegistrations()
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo confirmar.'
  } finally {
    regBusy.value = null
  }
}

async function viewRegProof(r) {
  closeProof()
  try {
    const { blob, mime } = await adminService.fetchEventRegistrationPaymentProof(r.id)
    proofMime.value = mime
    proofUrl.value = URL.createObjectURL(blob)
    proofOpen.value = true
  } catch {
    error.value = 'No se pudo cargar el comprobante.'
  }
}

function closeProof() {
  if (proofUrl.value) URL.revokeObjectURL(proofUrl.value)
  proofUrl.value = ''
  proofOpen.value = false
}

watch(tab, (v) => {
  if (v === 'regs') loadRegistrations()
})

onMounted(loadAll)
</script>
