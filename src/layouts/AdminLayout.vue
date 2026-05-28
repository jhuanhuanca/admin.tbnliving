<!-- layouts/AdminLayout.vue -->
<template>
  <div class="flex h-screen bg-bg">
    <Sidebar />

    <div class="flex min-w-0 flex-1 flex-col">
      <Navbar />

      <main class="min-w-0 flex-1 overflow-y-auto p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <ToastHost />
  </div>
</template>

<script setup>
import Sidebar from '../components/admin/Sidebar.vue'
import Navbar from '../components/admin/Navbar.vue'
import ToastHost from '../components/admin/ToastHost.vue'
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