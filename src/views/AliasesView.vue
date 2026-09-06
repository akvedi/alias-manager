<script setup lang="ts">
import { ref } from 'vue'
import CreateAliasModal from '@/components/CreateAliasModal.vue'

interface Alias {
  id: number
  address: string
  destination: string
  enabled: boolean
}

const aliases = ref<Alias[]>([
  {
    id: 1,
    address: 'github@example.com',
    destination: 'you@gmail.com',
    enabled: true,
  },
  {
    id: 2,
    address: 'amazon@example.com',
    destination: 'you@gmail.com',
    enabled: true,
  },
  {
    id: 3,
    address: 'newsletter@example.com',
    destination: 'you@gmail.com',
    enabled: false,
  },
])

const showCreateModal = ref(false)

function toggleAlias(alias: Alias) {
  alias.enabled = !alias.enabled
}

function openCreateModal() {
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function createAlias(address: string, destination: string) {
  const newAlias: Alias = {
    id: Date.now(),
    address,
    destination,
    enabled: true,
  }

  aliases.value.push(newAlias)

  showCreateModal.value = false
}
</script>

<template>
  <div class="aliases-page">
    <div class="page-header">
      <div>
        <h1>Aliases</h1>
        <p>Manage your email aliases.</p>
      </div>

<button
  class="create-button"
  @click="openCreateModal"
>
  + Create alias
</button>
    </div>

    <div class="alias-list">
      <div
        v-for="alias in aliases"
        :key="alias.id"
        class="alias-card"
      >
        <div class="alias-information">
          <h2>{{ alias.address }}</h2>
          <p>→ {{ alias.destination }}</p>
        </div>

        <div class="alias-actions">
          <span
            class="status"
            :class="{ disabled: !alias.enabled }"
          >
            {{ alias.enabled ? 'Active' : 'Disabled' }}
          </span>

          <button
            class="toggle-button"
            @click="toggleAlias(alias)"
          >
            {{ alias.enabled ? 'Disable' : 'Enable' }}
          </button>
        </div>
      </div>
    </div>
    
    <CreateAliasModal
      v-if="showCreateModal"
      @close="closeCreateModal"
      @create="createAlias"
    />
  </div>
</template>

<style scoped>
.aliases-page {
  max-width: 1000px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.page-header p {
  margin: 0;
  color: #666;
}

.create-button {
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  background: #111;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.create-button:hover {
  background: #333;
}

.alias-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alias-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.alias-information h2 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
}

.alias-information p {
  margin: 0;
  color: #666;
}

.alias-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status {
  font-size: 13px;
  font-weight: 600;
}

.status.disabled {
  color: #888;
}

.toggle-button {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.toggle-button:hover {
  background: #f5f5f5;
}
</style>