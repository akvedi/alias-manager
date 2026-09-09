<script setup lang="ts">
import { ref } from 'vue'
import { authClient } from '@/lib/auth-client'

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function register() {
  error.value = ''
  loading.value = true

  const result = await authClient.signUp.email({
    name: name.value,
    email: email.value,
    password: password.value,
  })

  loading.value = false

  if (result.error) {
    error.value = result.error.message ?? 'Registration failed'
    return
  }

  window.location.href = '/'
}
</script>

<template>
  <main class="register-page">
    <div class="register-card">
      <h1>Create your account</h1>
      <p>Start managing your email aliases.</p>

      <form @submit.prevent="register">
        <label>
          Name
          <input
            v-model="name"
            type="text"
            required
          />
        </label>

        <label>
          Email
          <input
            v-model="email"
            type="email"
            required
          />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            minlength="8"
            required
          />
        </label>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

label {
  display: grid;
  gap: 6px;
}

input {
  padding: 10px;
}

button {
  padding: 10px;
}

.error {
  color: #b00020;
}
</style>
