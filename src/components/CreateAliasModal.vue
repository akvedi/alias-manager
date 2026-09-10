<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Domain {
  id: string
  domain: string
}

const emit = defineEmits<{
  close: []
  create: [address: string, destination: string]
}>()

const localPart = ref('')
const selectedDomain = ref('')
const destination = ref('')

const domains = ref<Domain[]>([])
const loadingDomains = ref(true)
const error = ref('')

async function loadDomains() {
  loadingDomains.value = true
  error.value = ''

  try {
    const response = await fetch('/api/domains')

    if (!response.ok) {
      throw new Error('Failed to load domains')
    }

    domains.value = await response.json()

    if (domains.value.length > 0) {
      selectedDomain.value = domains.value[0].domain
    }
  } catch {
    error.value = 'Could not load your domains.'
  } finally {
    loadingDomains.value = false
  }
}

function closeModal() {
  emit('close')
}

function createAlias() {
  if (
    !localPart.value ||
    !selectedDomain.value ||
    !destination.value
  ) {
    return
  }

  const address = `${localPart.value}@${selectedDomain.value}`

  emit(
    'create',
    address,
    destination.value,
  )

  localPart.value = ''
  selectedDomain.value = ''
  destination.value = ''
}

onMounted(() => {
  loadDomains()
})
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2>Create Alias</h2>

      <form @submit.prevent="createAlias">
        <label>
          Alias name
          <input
            v-model="localPart"
            type="text"
            placeholder="github"
            required
          />
        </label>

        <label>
          Domain
          <select
            v-model="selectedDomain"
            :disabled="loadingDomains || domains.length === 0"
            required
          >
            <option
              v-for="domain in domains"
              :key="domain.id"
              :value="domain.domain"
            >
              {{ domain.domain }}
            </option>
          </select>
        </label>

        <p v-if="loadingDomains">
          Loading domains...
        </p>

        <p v-else-if="domains.length === 0">
          You don't have any domains yet.
        </p>

        <label>
          Destination
          <input
            v-model="destination"
            type="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <div class="modal-actions">
          <button
            type="button"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="
              loadingDomains ||
              domains.length === 0
            "
          >
            Create Alias
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  display: grid;
  place-items: center;
}

.modal {
  width: 100%;
  max-width: 500px;
  padding: 24px;
  background: white;
  border-radius: 8px;
}

form {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

label {
  display: grid;
  gap: 6px;
}

input,
select {
  padding: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.error {
  color: #b00020;
}
</style>
