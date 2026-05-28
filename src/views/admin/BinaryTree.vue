<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-text">Árbol binario</h1>
        <p class="text-sm text-text-muted">
          Busca por código o correo, selecciona un distribuidor y expande su red con + / −.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-2 text-xs text-text-muted">
          <span class="h-3 w-3 rounded-full bg-success" /> Activación mensual
        </span>
        <span class="inline-flex items-center gap-2 text-xs text-text-muted">
          <span class="h-3 w-3 rounded-full bg-danger" /> Sin activación mensual
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div class="space-y-4">
        <div class="card">
          <div class="card-body space-y-3">
            <label class="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Buscar distribuidor
            </label>
            <div class="flex flex-wrap gap-2">
              <input
                v-model="searchQuery"
                type="search"
                class="input min-w-[220px] flex-1"
                placeholder="Código de miembro o correo electrónico"
                autocomplete="off"
                @keydown.enter.prevent="runSearch"
              />
              <button type="button" class="btn btn-primary" :disabled="searching" @click="runSearch">
                {{ searching ? 'Buscando…' : 'Buscar' }}
              </button>
              <button type="button" class="btn btn-ghost" :disabled="loading" @click="loadDefaultRoot">
                Raíz global
              </button>
            </div>

            <p v-if="searchError" class="text-sm text-danger">{{ searchError }}</p>

            <ul
              v-if="searchResults.length"
              class="max-h-48 overflow-auto rounded-lg border border-border divide-y divide-border"
            >
              <li v-for="row in searchResults" :key="row.id">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition"
                  @click="selectSearchResult(row)"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-black">{{ row.name }}</p>
                    <p class="truncate text-xs text-text-muted">
                      {{ row.member_code || '—' }} · {{ row.email }}
                    </p>
                  </div>
                  <span class="badge shrink-0" :class="row.is_active ? 'badge-success' : 'badge-danger'">
                    {{ row.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <p class="text-sm font-semibold text-text">
              Red binaria
              <span v-if="treeRoot" class="font-normal">
                — <span class="text-black">{{ treeRoot.name }}</span>
                <span class="text-text-muted"> ({{ treeRoot.code }})</span>
              </span>
            </p>
            <button type="button" class="btn btn-ghost btn-sm" :disabled="loading" @click="reloadCurrent">
              Recargar
            </button>
          </div>
          <div class="card-body">
            <div v-if="loading" class="space-y-3 py-8">
              <div class="skeleton mx-auto h-4 w-40" />
              <div class="skeleton mx-auto h-16 w-52 rounded-full" />
            </div>
            <p v-else-if="treeError" class="text-sm text-danger text-center py-8">{{ treeError }}</p>
            <div v-else-if="treeRoot" class="ab-tree-canvas overflow-x-auto py-4">
              <AdminBinaryBranch :node="treeRoot" @select="onNodeSelect" />
            </div>
            <p v-else class="text-sm text-text-muted text-center py-8">
              Busca un usuario o carga la raíz global del árbol.
            </p>
          </div>
        </div>
      </div>

      <aside class="card h-fit xl:sticky xl:top-4">
        <div class="card-header">
          <p class="text-sm font-semibold text-text">Ficha del distribuidor</p>
        </div>
        <div class="card-body">
          <div v-if="detailLoading" class="space-y-2">
            <div class="skeleton h-4 w-full" />
            <div class="skeleton h-4 w-3/4" />
            <div class="skeleton h-4 w-1/2" />
          </div>
          <p v-else-if="!selectedDetail" class="text-sm text-text-muted">
            Haz clic en un nodo del árbol o elige un resultado de búsqueda.
          </p>
          <dl v-else class="space-y-3 text-sm">
            <div>
              <dt class="text-xs text-text-muted">Nombre</dt>
              <dd class="font-semibold text-black">{{ selectedDetail.name }}</dd>
            </div>
            <div>
              <dt class="text-xs text-text-muted">Código / correo</dt>
              <dd class="text-text break-all">
                {{ selectedDetail.member_code || '—' }}<br />
                <span class="text-text-muted">{{ selectedDetail.email }}</span>
              </dd>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="badge" :class="selectedDetail.is_active ? 'badge-success' : 'badge-danger'">
                {{ selectedDetail.is_active ? 'Activación mensual OK' : 'Sin activación mensual' }}
              </span>
              <span class="badge badge-info">{{ selectedDetail.rank }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-lg bg-bg-2 p-2">
                <p class="text-text-muted">PV mes</p>
                <p class="font-semibold text-text">{{ formatPv(selectedDetail.monthly_qualifying_pv) }}</p>
              </div>
              <div class="rounded-lg bg-bg-2 p-2">
                <p class="text-text-muted">Estado cuenta</p>
                <p class="font-semibold text-text capitalize">{{ selectedDetail.account_status || '—' }}</p>
              </div>
            </div>
            <div v-if="selectedDetail.sponsor">
              <dt class="text-xs text-text-muted">Patrocinador</dt>
              <dd class="text-text">
                {{ selectedDetail.sponsor.name }}
                <span class="text-text-muted">({{ selectedDetail.sponsor.member_code || '—' }})</span>
              </dd>
            </div>
            <div v-if="selectedDetail.binary_parent">
              <dt class="text-xs text-text-muted">Padre binario</dt>
              <dd class="text-text">
                {{ selectedDetail.binary_parent.name }}
                <span class="text-text-muted">
                  · pierna {{ legLabel(selectedDetail.binary_leg) }}
                </span>
              </dd>
            </div>
            <button
              type="button"
              class="btn btn-primary w-full"
              :disabled="loading"
              @click="setRootFromDetail"
            >
              Ver árbol desde este usuario
            </button>
          </dl>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AdminBinaryBranch from '@/components/admin/AdminBinaryBranch.vue'
import { adminService } from '@/services/api/adminService'
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()

const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const searchError = ref('')

const rootUserId = ref(null)
const treeRoot = ref(null)
const loading = ref(false)
const treeError = ref('')

const selectedDetail = ref(null)
const detailLoading = ref(false)

function formatPv(v) {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n.toLocaleString('es-BO', { maximumFractionDigits: 2 }) : '0'
}

function legLabel(leg) {
  if (leg === 'left') return 'izquierda'
  if (leg === 'right') return 'derecha'
  return leg || '—'
}

async function loadUserDetail(userId) {
  if (!userId) return
  detailLoading.value = true
  try {
    selectedDetail.value = await adminService.getBinaryTreeUser(userId)
  } catch {
    selectedDetail.value = null
    ui.toast({ type: 'error', title: 'Error', message: 'No se pudo cargar la ficha.' })
  } finally {
    detailLoading.value = false
  }
}

async function loadTreeRoot(userId = null) {
  loading.value = true
  treeError.value = ''
  try {
    const params = userId ? { root_user_id: userId } : {}
    const payload = await adminService.getBinaryTreeRootPayload(params)
    if (!payload?.ok && payload?.message) {
      treeError.value = payload.message
      treeRoot.value = null
      return
    }
    treeRoot.value = payload?.node ?? (await adminService.getBinaryTreeRoot(params))
    rootUserId.value = userId ?? treeRoot.value?.id ?? null
    if (payload?.user) {
      selectedDetail.value = payload.user
    } else if (treeRoot.value?.id) {
      await loadUserDetail(treeRoot.value.id)
    }
  } catch (e) {
    treeRoot.value = null
    treeError.value = e?.response?.data?.message || 'No se pudo cargar el árbol.'
  } finally {
    loading.value = false
  }
}

function loadDefaultRoot() {
  rootUserId.value = null
  searchResults.value = []
  searchQuery.value = ''
  loadTreeRoot(null)
}

function reloadCurrent() {
  loadTreeRoot(rootUserId.value)
}

async function runSearch() {
  const q = searchQuery.value.trim()
  if (q.length < 2) {
    searchError.value = 'Escribe al menos 2 caracteres.'
    searchResults.value = []
    return
  }
  searching.value = true
  searchError.value = ''
  try {
    searchResults.value = await adminService.searchBinaryTreeUsers(q)
    if (!searchResults.value.length) {
      searchError.value = 'Sin resultados para ese código o correo.'
    }
  } catch (e) {
    searchResults.value = []
    searchError.value = e?.response?.data?.message || 'Error en la búsqueda.'
  } finally {
    searching.value = false
  }
}

async function selectSearchResult(row) {
  rootUserId.value = row.id
  searchResults.value = []
  await loadTreeRoot(row.id)
  if (!row.in_tree) {
    ui.toast({
      type: 'warn',
      title: 'Sin colocación binaria',
      message: 'Este usuario aún no tiene posición en el árbol binario.',
    })
  }
}

function onNodeSelect(node) {
  if (node?.id) loadUserDetail(node.id)
}

function setRootFromDetail() {
  if (selectedDetail.value?.id) {
    rootUserId.value = selectedDetail.value.id
    loadTreeRoot(selectedDetail.value.id)
  }
}

onMounted(() => {
  loadDefaultRoot()
})
</script>

<style scoped>
.ab-tree-canvas {
  min-height: 280px;
  display: flex;
  justify-content: center;
}
</style>
