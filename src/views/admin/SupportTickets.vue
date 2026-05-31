<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Tickets de soporte</h1>
        <p class="text-sm text-text-muted">
          Seguimiento a solicitudes enviadas desde Mi cuenta. Actualiza estado y prioridad.
        </p>
      </div>
      <button class="btn btn-ghost" type="button" :disabled="loading" @click="load">Actualizar</button>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <label class="text-sm text-text-muted">Estado</label>
      <select v-model="filtroEstado" class="input w-auto" @change="load">
        <option value="all">Todos</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
      <label class="text-sm text-text-muted">Prioridad</label>
      <select v-model="filtroPrioridad" class="input w-auto" @change="load">
        <option value="all">Todas</option>
        <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
      </select>
    </div>

    <p v-if="error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{{ error }}</p>
    <p v-if="saveMsg" class="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-text">{{ saveMsg }}</p>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">Ticket</th>
              <th class="px-4 py-3 font-semibold">Código socio</th>
              <th class="px-4 py-3 font-semibold">Socio</th>
              <th class="px-4 py-3 font-semibold">Asunto</th>
              <th class="px-4 py-3 font-semibold">Categoría</th>
              <th class="px-4 py-3 font-semibold">Prioridad</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
              <th class="px-4 py-3 font-semibold">Fecha</th>
              <th class="px-4 py-3 text-end font-semibold">Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="px-4 py-8 text-center text-text-muted">Cargando…</td>
            </tr>
            <tr v-for="t in rows" v-else :key="t.id" class="border-t border-border">
              <td class="px-4 py-3 font-mono text-xs font-semibold">{{ t.code }}</td>
              <td class="px-4 py-3 font-medium">{{ memberCode(t) }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-text">{{ t.user?.name || '—' }}</div>
                <div class="text-xs text-text-muted">{{ t.user?.email || '—' }}</div>
              </td>
              <td class="px-4 py-3 max-w-[200px]">
                <span class="line-clamp-2">{{ t.subject }}</span>
              </td>
              <td class="px-4 py-3 text-text-muted">{{ t.category || '—' }}</td>
              <td class="px-4 py-3">
                <select
                  v-model="draftPriority[t.id]"
                  class="input py-1 text-xs"
                  :disabled="savingId === t.id"
                  @change="saveTicket(t, { priority: draftPriority[t.id] })"
                >
                  <option v-for="p in priorities" :key="p" :value="p">{{ p }}</option>
                </select>
              </td>
              <td class="px-4 py-3">
                <select
                  v-model="draftStatus[t.id]"
                  class="input py-1 text-xs"
                  :disabled="savingId === t.id"
                  @change="saveTicket(t, { status: draftStatus[t.id] })"
                >
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </td>
              <td class="px-4 py-3 text-xs text-text-muted">{{ formatDate(t.created_at) }}</td>
              <td class="px-4 py-3 text-end">
                <button type="button" class="btn btn-ghost btn-sm" @click="openDetail(t)">Ver</button>
              </td>
            </tr>
            <tr v-if="!loading && !rows.length">
              <td colspan="9" class="px-4 py-8 text-center text-text-muted">No hay tickets con este filtro.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="meta?.total != null" class="border-t border-border px-4 py-2 text-xs text-text-muted">
        {{ meta.total }} registro(s)
      </p>
    </div>

    <Modal :open="detailOpen" title="Detalle del ticket" :subtitle="detailSubtitle" @close="closeDetail">
      <div v-if="selected" class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-border bg-white/2 px-3 py-2">
            <p class="text-xs text-text-muted">Socio</p>
            <p class="text-sm font-semibold text-text">{{ selected.user?.name || '—' }}</p>
            <p class="text-xs text-text-muted">
              Código: {{ memberCode(selected) }} · {{ selected.user?.email || '—' }}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-white/2 px-3 py-2">
            <p class="text-xs text-text-muted">Ticket</p>
            <p class="text-sm font-semibold font-mono">{{ selected.code }}</p>
            <p class="text-xs text-text-muted">{{ selected.category }} · {{ formatDate(selected.created_at) }}</p>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-white/2 px-3 py-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-text-muted">Mensaje del socio</p>
          <p class="mt-2 whitespace-pre-wrap text-sm text-text">{{ selected.message }}</p>
        </div>

        <div>
          <label class="text-xs font-semibold text-text-muted">Notas internas (admin)</label>
          <textarea
            v-model="adminNotes"
            class="input mt-1 min-h-[88px] w-full text-sm"
            placeholder="Seguimiento interno, respuesta enviada, referencia de pago…"
          />
          <button
            type="button"
            class="btn btn-primary btn-sm mt-2"
            :disabled="savingId === selected.id"
            @click="saveTicket(selected, { admin_notes: adminNotes })"
          >
            Guardar notas
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Modal from '@/components/admin/Modal.vue'
import { adminService } from '@/services/api/adminService'
import { apiErrorMessage } from '@/utils/apiErrorMessage'

const statuses = ['Abierto', 'En proceso', 'Resuelto', 'Cerrado']
const priorities = ['Baja', 'Media', 'Alta']

const loading = ref(false)
const savingId = ref(null)
const error = ref('')
const saveMsg = ref('')
const rows = ref([])
const meta = ref(null)
const filtroEstado = ref('all')
const filtroPrioridad = ref('all')
const draftStatus = reactive({})
const draftPriority = reactive({})
const detailOpen = ref(false)
const selected = ref(null)
const adminNotes = ref('')

const detailSubtitle = computed(() => {
  if (!selected.value) return ''
  return `${selected.value.code} · ${selected.value.subject}`
})

function memberCode(ticket) {
  return ticket?.user?.member_code || ticket?.user?.referral_code || '—'
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-BO')
  } catch {
    return iso
  }
}

function syncDrafts(list) {
  for (const t of list) {
    draftStatus[t.id] = t.status
    draftPriority[t.id] = t.priority
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const { rows: data, meta: m } = await adminService.listSupportTickets({
      estado: filtroEstado.value,
      prioridad: filtroPrioridad.value,
      per_page: 50,
    })
    rows.value = data || []
    meta.value = m
    syncDrafts(rows.value)
  } catch (e) {
    error.value = apiErrorMessage(e, 'No se pudieron cargar los tickets.')
    rows.value = []
  } finally {
    loading.value = false
  }
}

function openDetail(t) {
  selected.value = t
  adminNotes.value = t.meta?.admin_notes || ''
  detailOpen.value = true
}

function closeDetail() {
  detailOpen.value = false
  selected.value = null
  adminNotes.value = ''
}

async function saveTicket(ticket, payload) {
  savingId.value = ticket.id
  error.value = ''
  saveMsg.value = ''
  try {
    const updated = await adminService.updateSupportTicket(ticket.id, payload)
    const idx = rows.value.findIndex((r) => r.id === ticket.id)
    if (idx >= 0) rows.value[idx] = { ...rows.value[idx], ...updated }
    if (selected.value?.id === ticket.id) {
      selected.value = { ...selected.value, ...updated }
      if (payload.admin_notes != null) adminNotes.value = payload.admin_notes
    }
    syncDrafts([updated])
    saveMsg.value = `Ticket ${ticket.code} actualizado.`
    setTimeout(() => {
      saveMsg.value = ''
    }, 2500)
  } catch (e) {
    error.value = apiErrorMessage(e, 'No se pudo guardar el ticket.')
    syncDrafts([ticket])
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>
