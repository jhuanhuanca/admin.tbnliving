<template>
  <div v-if="ui.mobileDrawerOpen" class="fixed inset-0 z-50 lg:hidden">
    <div class="absolute inset-0 bg-black/60" @click="ui.closeMobileDrawer()" />

    <div class="absolute left-0 top-0 h-full w-[86vw] max-w-[340px] bg-nav shadow-soft">
      <div class="flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-xl bg-brand/20 ring-1 ring-brand/30" />
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-white">Synkai Admin</p>
            <p class="truncate text-xs text-white/70">Enterprise Analytics</p>
          </div>
        </div>
        <button class="btn btn-ghost text-white hover:bg-white/10" @click="ui.closeMobileDrawer()">✕</button>
      </div>

      <div class="px-3 pb-6">
        <div v-for="section in sections" :key="section.title" class="mb-5">
          <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
            {{ section.title }}
          </p>
          <RouterLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            active-class="bg-white/10 text-white ring-1 ring-white/10"
            @click="ui.closeMobileDrawer()"
          >
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <IconSvg :name="item.icon" />
            </span>
            <span class="truncate">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { buildNavSections } from './navConfig'
import IconSvg from '@/components/enterprise/icons/IconSvg.vue'

const ui = useUiStore()
const sections = computed(() => buildNavSections())
</script>

