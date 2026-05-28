<template>
  <div class="ab-branch" :class="{ 'ab-branch--compact': compact }">
    <div
      class="ab-node"
      :class="node.is_active ? 'ab-node--active' : 'ab-node--inactive'"
      :title="node.is_active ? 'Activación mensual vigente' : 'Sin activación mensual'"
    >
      <button
        type="button"
        class="ab-node__main"
        @click="emit('select', node)"
      >
        <div class="ab-node__circle">
          <span class="ab-node__initials">{{ initials }}</span>
        </div>
        <div class="ab-node__meta min-w-0 text-left">
          <p class="ab-node__name truncate">{{ node.name }}</p>
          <p class="ab-node__code truncate">{{ node.code }}</p>
          <p class="ab-node__rank truncate">{{ node.rank || '—' }}</p>
        </div>
      </button>

      <button
        v-if="canExpand"
        type="button"
        class="ab-toggle"
        :disabled="loading"
        :title="isExpanded ? 'Ocultar red' : 'Ver red genealógica'"
        @click.stop="toggleExpand"
      >
        <span v-if="loading" class="ab-toggle__spin" aria-hidden="true" />
        <span v-else>{{ isExpanded ? '−' : '+' }}</span>
      </button>
    </div>

    <p v-if="loadError" class="text-xs text-danger mt-1">{{ loadError }}</p>

    <Transition name="ab-expand">
      <div v-if="isExpanded" class="ab-children">
        <div class="ab-children__row">
          <div class="ab-child">
            <span class="ab-leg ab-leg--left">Izq</span>
            <AdminBinaryBranch
              v-if="left"
              :node="left"
              :level="level + 1"
              :max-depth="maxDepth"
              compact
              @select="emit('select', $event)"
            />
            <div v-else class="ab-empty">
              <span class="ab-empty__label">Vacío</span>
            </div>
          </div>
          <div class="ab-child">
            <span class="ab-leg ab-leg--right">Der</span>
            <AdminBinaryBranch
              v-if="right"
              :node="right"
              :level="level + 1"
              :max-depth="maxDepth"
              compact
              @select="emit('select', $event)"
            />
            <div v-else class="ab-empty">
              <span class="ab-empty__label">Vacío</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { adminService } from '@/services/api/adminService'
import AdminBinaryBranch from '@/components/admin/AdminBinaryBranch.vue'

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, default: 1 },
  maxDepth: { type: Number, default: 14 },
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const isExpanded = ref(false)
const loading = ref(false)
const loadError = ref('')
const left = ref(props.node.left ?? null)
const right = ref(props.node.right ?? null)
const childrenLoaded = ref(Boolean(props.node.left || props.node.right))

const initials = computed(() => {
  const name = String(props.node?.name || '').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] || 'U'
  const b = parts[1]?.[0] || ''
  return `${a}${b}`.toUpperCase()
})

const canExpand = computed(() => {
  if (props.level >= props.maxDepth) return false
  if (childrenLoaded.value) return Boolean(left.value || right.value)
  return Boolean(props.node?.has_children)
})

async function toggleExpand() {
  if (!canExpand.value) return
  if (!isExpanded.value && !childrenLoaded.value) {
    await loadChildren()
  }
  isExpanded.value = !isExpanded.value
}

async function loadChildren() {
  loading.value = true
  loadError.value = ''
  try {
    const n = await adminService.getBinaryNodeChildren(props.node.id)
    left.value = n?.left || null
    right.value = n?.right || null
    childrenLoaded.value = true
    if (!left.value && !right.value) {
      loadError.value = 'Sin hijos binarios cargados.'
    }
  } catch {
    loadError.value = 'No se pudieron cargar los hijos.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ab-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ab-node {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 0.35rem;
  width: min(240px, 100%);
  padding: 0.5rem;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #d7ddd9;
  box-shadow: 0 4px 14px rgba(34, 45, 37, 0.08);
}

.ab-node--active {
  border-color: rgba(46, 189, 133, 0.45);
  box-shadow: 0 0 0 1px rgba(46, 189, 133, 0.2), 0 10px 28px rgba(0, 0, 0, 0.28);
}

.ab-node--inactive {
  border-color: rgba(246, 70, 93, 0.5);
  box-shadow: 0 0 0 1px rgba(246, 70, 93, 0.22), 0 10px 28px rgba(0, 0, 0, 0.28);
}

.ab-node__main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #111827;
  text-align: left;
}

.ab-node__main:hover {
  opacity: 0.92;
}

.ab-node__circle {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.ab-node--active .ab-node__circle {
  background: linear-gradient(145deg, #2ebd85, #1a8f5c);
}

.ab-node--inactive .ab-node__circle {
  background: linear-gradient(145deg, #f6465d, #b91c2c);
}

.ab-node__initials {
  color: #fff;
  font-weight: 800;
  font-size: 0.8rem;
}

.ab-node__name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #000000;
  margin: 0;
}

.ab-node__code,
.ab-node__rank {
  font-size: 0.68rem;
  color: #4b5563;
  margin: 0.1rem 0 0;
}

.ab-node__code {
  font-family: ui-monospace, monospace;
}

.ab-toggle {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  align-self: center;
  border-radius: 999px;
  border: none;
  background: #2ebd85;
  color: #0b0f14;
  font-weight: 900;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 120ms ease, filter 120ms ease;
}

.ab-node--inactive .ab-toggle {
  background: #f6465d;
  color: #fff;
}

.ab-toggle:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: scale(1.04);
}

.ab-toggle:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ab-toggle__spin {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: ab-spin 0.7s linear infinite;
}

@keyframes ab-spin {
  to {
    transform: rotate(360deg);
  }
}

.ab-children {
  width: 100%;
  margin-top: 12px;
  padding-top: 8px;
  position: relative;
}

.ab-children::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 14px;
  background: rgba(255, 255, 255, 0.12);
}

.ab-children__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
  padding-top: 10px;
  position: relative;
}

.ab-children__row::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 12%;
  right: 12%;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.ab-child {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  position: relative;
}

.ab-child::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
}

.ab-leg {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 999px;
}

.ab-leg--left {
  color: #6eb5ff;
  background: rgba(110, 181, 255, 0.12);
}

.ab-leg--right {
  color: #f0b429;
  background: rgba(240, 180, 41, 0.12);
}

.ab-empty {
  width: min(200px, 100%);
  padding: 1rem;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  text-align: center;
}

.ab-empty__label {
  font-size: 0.72rem;
  color: #6b7280;
}

.ab-expand-enter-active,
.ab-expand-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.ab-expand-enter-from,
.ab-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 768px) {
  .ab-children__row {
    grid-template-columns: 1fr;
  }
}
</style>
