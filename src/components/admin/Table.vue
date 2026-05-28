<template>
  <div class="card overflow-hidden">
    <div v-if="title || $slots.actions" class="card-header">
      <div class="min-w-0">
        <p v-if="title" class="truncate text-sm font-semibold text-text">{{ title }}</p>
        <p v-if="subtitle" class="truncate text-xs text-text-muted">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-white/3">
          <tr class="text-xs text-text-muted">
            <th v-for="c in columns" :key="c.key" class="whitespace-nowrap px-5 py-3 font-semibold">
              {{ c.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-5 py-6">
              <div class="space-y-3">
                <div v-for="i in 6" :key="i" class="skeleton h-4 w-full" />
              </div>
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="row in rows"
              :key="rowKey ? row[rowKey] : JSON.stringify(row)"
              class="border-t border-border transition hover:bg-white/3"
              :class="clickable ? 'cursor-pointer' : 'cursor-default'"
              @click="clickable && $emit('rowClick', row)"
            >
              <td v-for="c in columns" :key="c.key" class="whitespace-nowrap px-5 py-3">
                <slot :name="`cell:${c.key}`" :row="row">
                  <span class="text-text-muted">{{ row[c.key] ?? '-' }}</span>
                </slot>
              </td>
            </tr>

            <tr v-if="!rows.length">
              <td :colspan="columns.length" class="px-5 py-10 text-center text-sm text-text-muted">
                {{ emptyText }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="showFooter" class="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
      <p class="text-xs text-text-muted">
        {{ footerText }}
      </p>
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost" :disabled="page <= 1 || loading" @click="$emit('update:page', page - 1)">
          Anterior
        </button>
        <button class="btn btn-ghost" :disabled="page >= totalPages || loading" @click="$emit('update:page', page + 1)">
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  columns: { type: Array, required: true }, // [{ key, label }]
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rowKey: { type: String, default: 'id' },
  emptyText: { type: String, default: 'Sin datos' },
  clickable: { type: Boolean, default: true },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  paginate: { type: Boolean, default: true },
})

defineEmits(['rowClick', 'update:page'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const showFooter = computed(() => props.paginate && (props.total > props.pageSize || props.page > 1))
const footerText = computed(() => {
  if (!props.total) return '0 resultados'
  const from = (props.page - 1) * props.pageSize + 1
  const to = Math.min(props.total, props.page * props.pageSize)
  return `${from}-${to} de ${props.total}`
})
</script>

