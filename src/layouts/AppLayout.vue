<script setup lang="ts">
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo">
        Alias Manager
      </div>

      <nav class="navigation">
        <RouterLink to="/">
          Dashboard
        </RouterLink>

        <RouterLink to="/aliases">
          Aliases
        </RouterLink>

        <RouterLink to="/domains">
          Domains
        </RouterLink>

        <RouterLink to="/settings">
          Settings
        </RouterLink>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <span>Alias Manager</span>
        <span>Account</span>
      </header>

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

.sidebar {
  width: 240px;
  padding: 24px;
  border-right: 1px solid #ddd;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 32px;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.navigation a {
  padding: 10px 12px;
  text-decoration: none;
  color: #444;
  border-radius: 6px;
}

.navigation a:hover {
  background: #f2f2f2;
}

.navigation a.router-link-active {
  background: #e8e8e8;
  color: #111;
  font-weight: 600;
}

.main-content {
  flex: 1;
}

.topbar {
  height: 64px;
  padding: 0 32px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-content {
  padding: 32px;
}
</style>