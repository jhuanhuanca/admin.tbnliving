<template>
  <div class="card overflow-hidden">
    <div class="card-header flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-text">{{ title }}</p>
        <p v-if="subtitle" class="text-xs text-text-muted">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <input v-if="searchable" v-model="q" class="input h-9 w-64" placeholder="Buscar…" @input="debouncedReload" />
        <slot name="actions" />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-white/3 text-xs text-text-muted">
          <tr>
            <th
              v-for="c in columns"
              :key="c.key"
              class="px-4 py-3 font-semibold"
              :class="c.align === 'end' ? 'text-end' : ''"
            >
              <button
                v-if="c.sortable"
                class="inline-flex items-center gap-2 hover:text-text"
                @click="toggleSort(c.key)"
              >
                {{ c.label }}
                <span class="text-[10px]">{{ sortKey === c.key ? (sortDir === 'asc' ? '↑' : '↓') : '' }}</span>
              </button>
              <span v-else>{{ c.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-4 py-6">
              <UiSkeleton klass="h-12 w-full rounded-2xl" />
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length" class="px-4 py-10">
              <UiEmptyState title="Sin resultados" description="Prueba otros filtros o rango de fechas." />
            </td>
          </tr>
          <tr v-else v-for="(r, idx) in rows" :key="rowKey(r, idx)" class="border-t border-border">
            <td
              v-for="c in columns"
              :key="c.key"
              class="px-4 py-3"
              :class="c.align === 'end' ? 'text-end' : 'text-text'"
            >
              <slot :name="`cell:${c.key}`" :row="r" :value="r[c.key]">
                <span class="text-text">{{ r[c.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-text-muted">
      <div>
        Página <span class="text-text">{{ page }}</span> · {{ rows.length }} filas
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-sm" :disabled="page <= 1 || loading" @click="setPage(page - 1)">Anterior</button>
        <button class="btn btn-ghost btn-sm" :disabled="loading || rows.length < pageSize" @click="setPage(page + 1)">
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

type Column = { key: string; label: string; sortable?: boolean; align?: 'start' | 'end' }

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  columns: { type: Array as () => Column[], required: true },
  fetcher: { type: Function as any, required: true }, // ({ page, pageSize, q, sortKey, sortDir }) => Promise<{ rows }>
  pageSize: { type: Number, default: 10 },
  searchable: { type: Boolean, default: true },
  rowKeyField: { type: String, default: 'id' },
})

const loading = ref(false)
const rows = ref<any[]>([])
const page = ref(1)
const q = ref('')
const sortKey = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('desc')

function rowKey(r: any, idx: number) {
  return r?.[props.rowKeyField] ?? `${idx}`
}

async function load() {
  loading.value = true
  try {
    const res = await props.fetcher({
      page: page.value,
      pageSize: props.pageSize,
      q: q.value,
      sortKey: sortKey.value,
      sortDir: sortDir.value,
    })
    rows.value = res?.rows || res?.data || []
  } finally {
    loading.value = false
  }
}

function setPage(p: number) {
  page.value = Math.max(1, p)
  load()
}

function toggleSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
  load()
}

let t: any = null
function debouncedReload() {
  clearTimeout(t)
  t = setTimeout(() => {
    page.value = 1
    load()
  }, 250)
}

onMounted(load)
</script>

