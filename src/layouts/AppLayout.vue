<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar />

    <main class="main-content">
      <AppTopbar />

      <section class="page-content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
}

.main-content {
  flex: 1;
}

.page-content {
  padding: 32px;
}
</style>