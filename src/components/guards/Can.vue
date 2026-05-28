<template>
  <slot v-if="ok" />
</template>

<script setup>
import { computed } from 'vue'
import { usePermissionsStore } from '@/stores/permissionsStore'

const props = defineProps({
  role: { type: String, default: null },
  permission: { type: String, default: null },
  any: { type: Array, default: null }, // ['perm.a', 'perm.b']
})

const perms = usePermissionsStore()

const ok = computed(() => {
  if (props.role) return perms.hasRole(props.role)
  if (props.permission) return perms.can(props.permission)
  if (Array.isArray(props.any) && props.any.length) return props.any.some((p) => perms.can(p))
  return true
})
</script>

