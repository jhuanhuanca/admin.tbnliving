<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-xl font-semibold text-text">Configuración MLM</h1>
      <p class="text-sm text-text-muted">
        Porcentajes, reglas binario, límites y activación mensual. (Solo superadmin)
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="card">
        <div class="card-header">
          <div>
            <p class="text-sm font-semibold text-text">Comisiones</p>
            <p class="text-xs text-text-muted">Porcentajes base</p>
          </div>
        </div>
        <div class="card-body grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="text-xs font-semibold text-text-muted">Binario (%)</label>
            <input v-model.number="form.binaryPct" type="number" min="0" step="0.1" class="input mt-1" />
          </div>
          <div>
            <label class="text-xs font-semibold text-text-muted">Directo (%)</label>
            <input v-model.number="form.directPct" type="number" min="0" step="0.1" class="input mt-1" />
          </div>
          <div>
            <label class="text-xs font-semibold text-text-muted">Matching (%)</label>
            <input v-model.number="form.matchingPct" type="number" min="0" step="0.1" class="input mt-1" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <p class="text-sm font-semibold text-text">Reglas binario</p>
            <p class="text-xs text-text-muted">Límites y activación</p>
          </div>
        </div>
        <div class="card-body grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="text-xs font-semibold text-text-muted">Límite diario (Bs.)</label>
            <input v-model.number="form.dailyLimit" type="number" min="0" step="1" class="input mt-1" />
          </div>
          <div>
            <label class="text-xs font-semibold text-text-muted">Activación mensual (Bs.)</label>
            <input v-model.number="form.monthlyActivation" type="number" min="0" step="1" class="input mt-1" />
          </div>
          <div class="md:col-span-2">
            <label class="inline-flex items-center gap-2 text-sm text-text">
              <input v-model="form.carryForward" type="checkbox" class="rounded border-border bg-bg-2" />
              Permitir “carry” de volumen
            </label>
          </div>
        </div>
      </div>

      <div class="card lg:col-span-2">
        <div class="card-body flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-text-muted">
            Guardado local (mock). Preparado para endpoint Laravel `PUT /api/admin/settings/mlm`.
          </p>
          <div class="flex items-center gap-2">
            <button class="btn btn-ghost" @click="reset">Reset</button>
            <button class="btn btn-primary" @click="save">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()
const LS_KEY = 'mlm_admin_settings_mlm'

const defaults = {
  binaryPct: 10,
  directPct: 5,
  matchingPct: 3,
  dailyLimit: 500,
  monthlyActivation: 50,
  carryForward: true,
}

const form = reactive({ ...defaults })

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    Object.assign(form, defaults, parsed)
  } catch {
    Object.assign(form, defaults)
  }
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(form))
  ui.toast({ type: 'success', title: 'Configuración guardada', message: 'Mock localStorage.' })
}

function reset() {
  Object.assign(form, defaults)
  ui.toast({ type: 'warn', title: 'Reset', message: 'Se restauraron valores por defecto.' })
}

onMounted(load)
</script>

