<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Retiros</h1>
        <p class="text-sm text-text-muted">Aprueba o rechaza solicitudes. El saldo quedó retenido al solicitar.</p>
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

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-white/3 text-xs text-text-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">ID</th>
              <th class="px-4 py-3 font-semibold">Socio</th>
              <th class="px-4 py-3 font-semibold">Monto</th>
              <th class="px-4 py-3 font-semibold">Estado</th>
              <th class="px-4 py-3 text-end font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="admin.loading.withdrawals">
              <td colspan="5" class="px-4 py-8 text-center text-text-muted">Cargando…</td>
            </tr>
            <tr v-for="w in admin.withdrawals.rows" v-else :key="w.id" class="border-t border-border">
              <td class="px-4 py-3 font-medium">{{ w.id }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-text">{{ w.user?.name || '—' }}</div>
                <div class="text-xs text-text-muted">{{ w.user?.email }} · {{ w.user?.member_code || '—' }}</div>
              </td>
              <td class="px-4 py-3 font-semibold">{{ formatBs(w.monto) }}</td>
              <td class="px-4 py-3">
                <span class="badge text-xs" :class="estadoBadgeClass(w.estado)">{{ w.estado }}</span>
              </td>
              <td class="px-4 py-3 text-end">
                <template v-if="w.estado === 'pendiente'">
                  <button type="button" class="btn btn-success btn-sm me-1" @click="aprobar(w.id)">Aprobar</button>
                  <div class="mt-2 flex flex-wrap justify-end gap-1">
                    <input
                      v-model="notasRechazo[w.id]"
                      type="text"
                      class="input max-w-[160px] py-1 text-xs"
                      placeholder="Motivo rechazo"
                    />
                    <button type="button" class="btn btn-danger btn-sm" @click="rechazar(w.id)">Rechazar</button>
                  </div>
                </template>
                <div class="flex justify-end gap-2">
                  <button type="button" class="btn btn-ghost btn-sm" @click="imprimir(w.id)">Imprimir</button>
                  <span v-if="w.estado === 'pendiente'" class="text-xs text-text-muted"></span>
                </div>
              </td>
            </tr>
            <tr v-if="!admin.loading.withdrawals && !admin.withdrawals.rows.length">
              <td colspan="5" class="px-4 py-8 text-center text-text-muted">Sin retiros en este filtro.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="admin.withdrawals.meta?.total != null" class="border-t border-border px-4 py-2 text-xs text-text-muted">
        {{ admin.withdrawals.meta.total }} registro(s)
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { useUiStore } from '@/stores/uiStore'
import { apiErrorMessage } from '@/utils/apiErrorMessage'
import { adminService } from '@/services/api/adminService'
import { usePrintDocument } from '@/composables/usePrintDocument'

const admin = useAdminStore()
const ui = useUiStore()
const { printFromFetch } = usePrintDocument()

const filtroEstado = ref('pendiente')
const error = ref('')
const notasRechazo = reactive({})

function formatBs(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return String(value ?? '—')
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', minimumFractionDigits: 2 }).format(n)
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
