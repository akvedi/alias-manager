<script setup lang="ts">
</script>

<template>
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
</template>

<style scoped>
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
</style>