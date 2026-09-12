<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { authClient } from '@/lib/auth-client'

const email = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const { data: session } = await authClient.getSession()

    email.value = session?.user?.email ?? ''
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
        Settings
      </h1>
  <p class="mt-1 text-sm text-slate-500">
    Manage your account and Alias Manager preferences.
  </p>
</div>

<div class="space-y-6">
  <!-- Account -->
  <section
    class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
  >
    <div class="border-b border-slate-200 px-6 py-5">
      <h2 class="text-base font-semibold text-slate-900">
        Account
      </h2>

      <p class="mt-1 text-sm text-slate-500">
        Your Alias Manager account information.
      </p>
    </div>

    <div class="px-6 py-5">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
          Email address
        </p>

        <p
          v-if="loading"
          class="mt-1 h-5 w-48 animate-pulse rounded bg-slate-100"
        />

        <p
          v-else
          class="mt-1 text-sm font-medium text-slate-900"
        >
          {{ email || 'Unable to load account information' }}
        </p>
      </div>
    </div>
  </section>

  <!-- Security -->
  <section
    class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
  >
    <div class="border-b border-slate-200 px-6 py-5">
      <h2 class="text-base font-semibold text-slate-900">
        Security
      </h2>

      <p class="mt-1 text-sm text-slate-500">
        Manage your account security.
      </p>
    </div>

    <div class="divide-y divide-slate-100">
      <div
        class="flex items-center justify-between gap-4 px-6 py-5"
      >
        <div>
          <p class="text-sm font-medium text-slate-900">
            Password
          </p>

          <p class="mt-1 text-sm text-slate-500">
            Change your account password.
          </p>
        </div>

        <button
          type="button"
          disabled
          class="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-400"
        >
          Coming soon
        </button>
      </div>
    </div>
  </section>
</div>

  </div>
</template>
