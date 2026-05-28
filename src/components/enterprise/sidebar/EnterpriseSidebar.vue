<template>
  <aside
    class="sticky top-0 hidden h-screen shrink-0 border-r border-border bg-nav/95 backdrop-blur lg:block"
    :class="ui.sidebarCollapsed ? 'w-[76px]' : 'w-72'"
  >
    <div class="flex h-16 items-center gap-3 px-4">
      <div class="h-9 w-9 rounded-xl bg-brand/20 ring-1 ring-brand/30" />
      <div v-if="!ui.sidebarCollapsed" class="min-w-0">
        <p class="truncate text-sm font-semibold text-white">Synkai Admin</p>
        <p class="truncate text-xs text-white/70">Enterprise Analytics</p>
      </div>
    </div>

    <nav class="px-3 pb-6 pt-3">
      <div v-for="section in sections" :key="section.title" class="mb-5">
        <p v-if="!ui.sidebarCollapsed" class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
          {{ section.title }}
        </p>

        <RouterLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          active-class="bg-white/10 text-white ring-1 ring-white/10"
        >
          <span
            class="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 group-[.router-link-active]:bg-brand/15 group-[.router-link-active]:ring-brand/30"
          >
            <IconSvg :name="item.icon" />
          </span>
          <span v-if="!ui.sidebarCollapsed" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </div>

      <button
        class="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
        @click="ui.toggleSidebar()"
      >
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
          <span class="text-xs font-semibold">⟷</span>
        </span>
        <span v-if="!ui.sidebarCollapsed">Colapsar</span>
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { buildNavSections } from './navConfig'
import IconSvg from '@/components/enterprise/icons/IconSvg.vue'

const ui = useUiStore()

const sections = computed(() => buildNavSections())
</script>

