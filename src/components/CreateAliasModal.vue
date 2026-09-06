<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  create: [address: string, destination: string]
}>()

const address = ref('')
const destination = ref('')

function closeModal() {
  emit('close')
}

function createAlias() {
  if (!address.value || !destination.value) {
    return
  }

  emit('create', address.value, destination.value)

  address.value = ''
  destination.value = ''
}
</script>

<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Create alias</h2>
          <p>Create a new email alias.</p>
        </div>

        <button
          class="close-button"
          @click="closeModal"
        >
          ×
        </button>
      </div>

      <form @submit.prevent="createAlias">
        <div class="form-group">
          <label for="address">
            Alias address
          </label>

          <input
            id="address"
            v-model="address"
            type="email"
            placeholder="github@example.com"
          />
        </div>

        <div class="form-group">
          <label for="destination">
            Destination
          </label>

          <input
            id="destination"
            v-model="destination"
            type="email"
            placeholder="you@gmail.com"
          />
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="cancel-button"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="create-button"
          >
            Create alias
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgb(0 0 0 / 50%);
}

.modal {
  width: 100%;
  max-width: 480px;
  padding: 24px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 20px 40px rgb(0 0 0 / 20%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.modal-header p {
  margin: 0;
  color: #666;
}

.close-button {
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: #666;
  cursor: pointer;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font: inherit;
}

.form-group input:focus {
  outline: 2px solid #999;
  outline-offset: 1px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.cancel-button,
.create-button {
  padding: 10px 16px;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid #ccc;
  background: white;
}

.create-button {
  border: none;
  background: #111;
  color: white;
}
</style>