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

<!-- <template>
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
</template> -->

<template>
  <main
    class="flex min-h-screen min-h-[100dvh] items-center justify-center
           bg-slate-50 px-4 py-8"
  >
    <div
      class="w-full max-w-sm rounded-2xl border border-slate-200
             bg-white p-8 shadow-xl shadow-slate-200/60"
    >
      <!-- Header -->
      <div class="mb-8">
        <div
          class="mb-5 flex h-10 w-10 items-center justify-center
                 rounded-lg bg-indigo-600 text-lg font-bold text-white"
        >
          @
        </div>

        <h1
          class="text-2xl font-bold tracking-tight text-slate-900"
        >
          Alias Manager
        </h1>

        <p class="mt-2 text-sm text-slate-500">
          Sign in to manage your aliases.
        </p>
      </div>

      <form
        @submit.prevent="login"
        class="space-y-5"
      >
        <!-- Email -->
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700">
            Email
          </span>

          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="h-11 w-full rounded-lg border border-slate-300
                   bg-white px-3.5 text-sm text-slate-900
                   outline-none transition
                   placeholder:text-slate-400
                   hover:border-slate-400
                   focus:border-indigo-500
                   focus:ring-4 focus:ring-indigo-500/10"
          />
        </label>

        <!-- Password -->
        <label class="block">
          <span class="mb-2 block text-sm font-medium text-slate-700">
            Password
          </span>

          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter your password"
            class="h-11 w-full rounded-lg border border-slate-300
                   bg-white px-3.5 text-sm text-slate-900
                   outline-none transition
                   placeholder:text-slate-400
                   hover:border-slate-400
                   focus:border-indigo-500
                   focus:ring-4 focus:ring-indigo-500/10"
          />
        </label>

        <!-- Error -->
        <p
          v-if="error"
          class="rounded-lg border border-red-200 bg-red-50
                 px-3 py-2.5 text-sm text-red-600"
          role="alert"
        >
          {{ error }}
        </p>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="h-11 w-full rounded-lg bg-indigo-600
                 px-4 text-sm font-semibold text-white
                 shadow-sm transition
                 hover:bg-indigo-700
                 focus:outline-none focus:ring-4 focus:ring-indigo-500/20
                 active:bg-indigo-800
                 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </main>
</template>
