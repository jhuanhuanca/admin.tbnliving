<template>
  <div class="min-h-screen bg-bg text-text">
    <EnterpriseCommandPalette />

    <EnterpriseMobileDrawer />

    <div class="flex">
      <EnterpriseSidebar />

      <div class="min-w-0 flex-1">
        <EnterpriseTopbar />

        <main class="min-w-0 px-4 pb-10 pt-6 sm:px-6">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>

    <ToastHost />
  </div>
</template>

<script setup>
import ToastHost from '@/components/admin/ToastHost.vue'
import EnterpriseSidebar from '@/components/enterprise/sidebar/EnterpriseSidebar.vue'
import EnterpriseTopbar from '@/components/enterprise/topbar/EnterpriseTopbar.vue'
import EnterpriseMobileDrawer from '@/components/enterprise/sidebar/EnterpriseMobileDrawer.vue'
import EnterpriseCommandPalette from '@/components/enterprise/command/EnterpriseCommandPalette.vue'
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(2px);
}
</style>

