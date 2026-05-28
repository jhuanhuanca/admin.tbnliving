<template>
  <section class="card">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>
    <div class="card-body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="border-t border-border px-4 py-3">
      <slot name="footer" />
    </footer>
  </section>
</template>

