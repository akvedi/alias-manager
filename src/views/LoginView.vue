<script setup lang="ts">
import { ref } from 'vue'
import { authClient } from '@/lib/auth-client'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true

  const result = await authClient.signIn.email({
    email: email.value,
    password: password.value,
  })

  loading.value = false

  if (result.error) {
    error.value = result.error.message ?? 'Login failed'
    return
  }

  window.location.href = '/'
}
</script>

<template>
  <main class="login-page">
    <div class="login-card">
      <h1>Alias Manager</h1>
      <p>Sign in to manage your aliases.</p>

      <form @submit.prevent="login">
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
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-card {
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
