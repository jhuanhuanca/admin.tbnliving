<template>
  <div class="card overflow-hidden">
    <div class="card-header">
      <p class="text-sm font-semibold text-text">Usuarios</p>
      <p class="text-xs text-text-muted">{{ users.length }} registros</p>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-white/3">
          <tr class="text-xs text-text-muted">
            <th class="px-5 py-3 font-semibold">Nombre</th>
            <th class="px-5 py-3 font-semibold">Email</th>
            <th class="px-5 py-3 font-semibold">Rango</th>
            <th class="px-5 py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.email" class="border-t border-border">
            <td class="px-5 py-3 text-text">{{ u.name }}</td>
            <td class="px-5 py-3 text-text-muted">{{ u.email }}</td>
            <td class="px-5 py-3">
              <span class="badge badge-info">{{ u.rank ?? '-' }}</span>
            </td>
            <td class="px-5 py-3">
              <span class="badge" :class="u.active ? 'badge-success' : 'badge-danger'">
                {{ u.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="4" class="px-5 py-8 text-center text-sm text-text-muted">Sin datos</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  users: { type: Array, required: true },
})
</script>

