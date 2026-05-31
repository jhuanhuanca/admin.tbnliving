<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Retiros</h1>
        <p class="text-sm text-text-muted">
          Aprueba o rechaza solicitudes. Revisa los datos de cobro del socio para realizar la transferencia.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select v-model="filtroEstado" class="input w-[200px]" @change="apply">
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobados</option>
          <option value="completado">Completados</option>
          <option value="rechazado">Rechazados</option>
          <option value="all">Todos</option>
        </select>
        <button class="btn btn-ghost" type="button" :disabled="admin.loading.withdrawals" @click="apply">Actualizar</button>
      </div>
    </div>

    <p v-if="error" class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{{ error }}</p>
    <p v-if="copyMsg" class="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-text">{{ copyMsg }}</p>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Socio</th>
              <th class="px-4 py-3 font-semibold">Monto</th>
              <th class="px-4 py-3 font-semibold">Datos de cobro</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
              <th class="px-4 py-3 text-end font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="admin.loading.withdrawals">
              <td colspan="6" class="px-4 py-8 text-center text-text-muted">Cargando…</td>
            </tr>
            <tr v-for="w in admin.withdrawals.rows" v-else :key="w.id" class="border-t border-border">
              <td class="px-4 py-3 font-medium">{{ w.id }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-text">{{ w.user?.name || '—' }}</div>
                <div class="text-xs text-text-muted">{{ w.user?.email }} · {{ w.user?.member_code || '—' }}</div>
              </td>
              <td class="px-4 py-3 font-semibold">{{ formatBs(w.monto) }}</td>
              <td class="px-4 py-3">
                <button type="button" class="btn btn-ghost btn-sm !px-2 text-left" @click="openDetail(w)">
                  Ver datos
                </button>
                <p class="mt-1 max-w-[220px] text-xs text-text-muted">
                  {{ walletSummary(w.user) }}
                </p>
              </td>
              <td class="px-4 py-3">
                <span class="badge text-xs" :class="estadoBadgeClass(w.estado)">{{ w.estado }}</span>
              </td>
              <td class="px-4 py-3 text-end">
                <div class="flex flex-wrap justify-end gap-1">
                  <template v-if="w.estado === 'pendiente'">
                    <button type="button" class="btn btn-success btn-sm" @click="aprobar(w.id)">Aprobar</button>
                    <button type="button" class="btn btn-danger btn-sm" @click="rechazar(w.id)">Rechazar</button>
                  </template>
                  <button type="button" class="btn btn-ghost btn-sm" @click="imprimir(w.id)">Imprimir</button>
                </div>
                <div v-if="w.estado === 'pendiente'" class="mt-2 flex justify-end">
                  <input
                    v-model="notasRechazo[w.id]"
                    type="text"
                    class="input max-w-[180px] py-1 text-xs"
                    placeholder="Motivo rechazo (opc.)"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="!admin.loading.withdrawals && !admin.withdrawals.rows.length">
              <td colspan="6" class="px-4 py-8 text-center text-text-muted">Sin retiros en este filtro.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="admin.withdrawals.meta?.total != null" class="border-t border-border px-4 py-2 text-xs text-text-muted">
        {{ admin.withdrawals.meta.total }} registro(s)
      </p>
    </div>

    <Modal
      :open="detailOpen"
      title="Datos de cobro para transferencia"
      :subtitle="detailSubtitle"
      @close="closeDetail"
    >
      <div v-if="selectedWithdrawal" class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-border bg-white/2 px-3 py-2">
            <p class="text-xs text-text-muted">Socio</p>
            <p class="text-sm font-semibold text-text">{{ selectedWithdrawal.user?.name || '—' }}</p>
            <p class="text-xs text-text-muted">
              {{ selectedWithdrawal.user?.email || '—' }} · código {{ selectedWithdrawal.user?.member_code || '—' }}
            </p>
          </div>
          <div class="rounded-xl border border-border bg-white/2 px-3 py-2">
            <p class="text-xs text-text-muted">Retiro #{{ selectedWithdrawal.id }}</p>
            <p class="text-sm font-semibold text-text">{{ formatBs(selectedWithdrawal.monto) }}</p>
            <p class="text-xs text-text-muted">Estado: {{ selectedWithdrawal.estado }}</p>
          </div>
        </div>

        <div class="rounded-xl border border-brand/25 bg-brand/5 px-3 py-3">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-brand">Configuración de billetera</p>
            <button
              v-if="walletConfigured(selectedWithdrawal.user)"
              type="button"
              class="btn btn-ghost btn-sm"
              @click="copyWalletData(selectedWithdrawal.user)"
            >
              Copiar datos
            </button>
          </div>
          <WalletSettingsPanel :user="selectedWithdrawal.user" />
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <button type="button" class="btn btn-ghost btn-sm" @click="imprimir(selectedWithdrawal.id)">Imprimir comprobante</button>
          <button type="button" class="btn btn-primary btn-sm" @click="closeDetail">Cerrar</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Modal from '@/components/admin/Modal.vue'
import WalletSettingsPanel from '@/components/admin/WalletSettingsPanel.vue'
import { useAdminStore } from '@/stores/adminStore'
import { useUiStore } from '@/stores/uiStore'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import { formatBob } from '@/utils/money'
import {
  walletSettingsConfigured,
  walletSettingsCopyText,
  walletSettingsFromUser,
  walletSettingsSummary,
} from '@/utils/walletSettingsDisplay'
import { adminService } from '@/services/api/adminService'
import { usePrintDocument } from '@/composables/usePrintDocument'

const admin = useAdminStore()
const ui = useUiStore()
const { printFromFetch } = usePrintDocument()

const filtroEstado = ref('pendiente')
const error = ref('')
const copyMsg = ref('')
const notasRechazo = reactive({})
const detailOpen = ref(false)
const selectedWithdrawal = ref(null)

const detailSubtitle = computed(() => {
  if (!selectedWithdrawal.value) return ''
  const w = selectedWithdrawal.value
  return `Retiro #${w.id} · ${w.user?.name || 'Socio'} · ${formatBs(w.monto)}`
})

function formatBs(value) {
  return formatBob(value)
}

function walletSummary(user) {
  return walletSettingsSummary(walletSettingsFromUser(user))
}

function walletConfigured(user) {
  return walletSettingsConfigured(walletSettingsFromUser(user))
}

function estadoBadgeClass(estado) {
  const m = {
    pendiente: 'badge-warn',
    aprobado: 'badge-info',
    completado: 'badge-success',
    rechazado: 'badge-danger',
  }
  return m[estado] || 'badge-ghost'
}

function openDetail(row) {
  selectedWithdrawal.value = row
  detailOpen.value = true
}

function closeDetail() {
  detailOpen.value = false
  selectedWithdrawal.value = null
}

async function copyWalletData(user) {
  const ws = walletSettingsFromUser(user)
  const text = walletSettingsCopyText(ws)
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copyMsg.value = 'Datos de cobro copiados al portapapeles.'
    setTimeout(() => {
      copyMsg.value = ''
    }, 2500)
  } catch {
    copyMsg.value = 'No se pudo copiar. Selecciona y copia manualmente desde el detalle.'
  }
}

async function apply() {
  error.value = ''
  try {
    await admin.fetchWithdrawals({ status: filtroEstado.value, per_page: 50 })
  } catch (e) {
    error.value = apiErrorMessage(e, 'No se pudieron cargar los retiros.')
  }
}

async function aprobar(id) {
  error.value = ''
  try {
    await admin.approveWithdrawal(id)
    ui.toast({ type: 'success', title: 'Retiro aprobado', message: `ID ${id}` })
    await apply()
    if (selectedWithdrawal.value?.id === id) {
      selectedWithdrawal.value = admin.withdrawals.rows.find((r) => r.id === id) || null
    }
  } catch (e) {
    error.value = apiErrorMessage(e, 'Error al aprobar.')
  }
}

async function rechazar(id) {
  error.value = ''
  try {
    await admin.rejectWithdrawal(id, notasRechazo[id] || null)
    notasRechazo[id] = ''
    ui.toast({ type: 'danger', title: 'Retiro rechazado', message: `ID ${id}` })
    await apply()
    if (selectedWithdrawal.value?.id === id) {
      selectedWithdrawal.value = admin.withdrawals.rows.find((r) => r.id === id) || null
    }
  } catch (e) {
    error.value = apiErrorMessage(e, 'Error al rechazar.')
  }
}

async function imprimir(id) {
  error.value = ''
  await printFromFetch(() => adminService.fetchWithdrawalPrintHtml(id), {
    loadingMessage: 'Cargando comprobante…',
    onError: (msg) => {
      error.value = msg
    },
  })
}

onMounted(apply)
</script>
