<script setup>
import { computed } from 'vue'
import {
  walletSettingsConfigured,
  walletSettingsDetailRows,
  walletSettingsFromUser,
} from '@/utils/walletSettingsDisplay'

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  settings: {
    type: Object,
    default: null,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const ws = computed(() => props.settings || walletSettingsFromUser(props.user))
const rows = computed(() => walletSettingsDetailRows(ws.value))
const configured = computed(() => walletSettingsConfigured(ws.value))
</script>

<template>
  <div class="wallet-settings-panel" :class="{ 'wallet-settings-panel--compact': compact }">
    <div
      v-if="!configured"
      class="rounded-xl border border-warn/30 bg-warn/5 px-3 py-3 text-sm text-text-muted"
    >
      El socio aún no configuró su billetera en <strong>Mi cuenta → Configurar billetera</strong>.
      Solicita los datos antes de transferir.
    </div>

    <dl v-else class="space-y-2">
      <div
        v-for="row in rows"
        :key="row.key"
        class="rounded-lg border border-border bg-white/2 px-3 py-2"
      >
        <dt class="text-xs font-semibold uppercase tracking-wide text-text-muted">{{ row.label }}</dt>
        <dd class="mt-1 text-sm font-medium text-text break-all" :class="{ 'font-mono text-xs': row.mono }">
          {{ row.value }}
        </dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.wallet-settings-panel--compact dl {
  display: grid;
  gap: 0.5rem;
}
</style>
