<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

interface Domain {
  id: string
  domain: string
  createdAt: number
}

const domains = ref<Domain[]>([])
const domain = ref('')
const error = ref('')
const loading = ref(false)
const loadingDomains = ref(true)
const deletingId = ref<string | null>(null)
const domainPendingDeletion = ref<Domain | null>(null)

async function loadDomains() {
  loadingDomains.value = true

  try {
    const response = await fetch('/api/domains')

    if (!response.ok) {
      throw new Error('Failed to load domains')
    }

    domains.value = await response.json()
  } catch {
    error.value = 'Could not load your domains. Please try again.'
  } finally {
    loadingDomains.value = false
  }
}

async function createDomain() {
  error.value = ''

  const value = domain.value.trim()

  if (!value) {
    return
  }

  loading.value = true

  try {
    const response = await fetch('/api/domains', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: value,
      }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      error.value =
        result?.error ?? 'Failed to create domain'
      return
    }

    domain.value = ''

    await loadDomains()
  } catch {
    error.value =
      'Could not add the domain. Please try again.'
  } finally {
    loading.value = false
  }
}

function requestDeleteDomain(domain: Domain) {
  domainPendingDeletion.value = domain
}

async function deleteDomain(item: Domain) {

  error.value = ''
  deletingId.value = item.id

  try {
    const response = await fetch(
      `/api/domains/${item.id}`,
      {
        method: 'DELETE',
      },
    )

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      error.value =
        result?.error ?? 'Failed to delete domain'
      return
    }

    await loadDomains()
  } catch {
    error.value =
      'Could not delete the domain. Please try again.'
  } finally {
    deletingId.value = null
    domainPendingDeletion.value = null
  }
}

onMounted(() => {
  loadDomains()
})
</script>

<template>
  <div class="mx-auto w-full max-w-5xl">
    <!-- Header -->
    <div
      class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <div class="flex items-center gap-3">
          <h1
            class="text-2xl font-semibold tracking-tight text-slate-900"
          >
            Domains
          </h1>
      <span
        v-if="!loadingDomains"
        class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
      >
        {{ domains.length }}
      </span>
    </div>

    <p class="mt-1 text-sm text-slate-500">
      Manage the domains connected to your account.
    </p>
  </div>
</div>

<!-- Add domain -->
<div
  class="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
>
  <div class="mb-4">
    <h2 class="text-sm font-semibold text-slate-900">
      Add a domain
    </h2>

    <p class="mt-1 text-sm text-slate-500">
      We'll verify that the domain exists in your MXroute account.
    </p>
  </div>

  <form
    class="flex flex-col gap-3 sm:flex-row"
    @submit.prevent="createDomain"
  >
    <div class="relative flex-1">
      <svg
        class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          stroke-linecap="round"
          d="M3 12h18M12 3c2.5 2.4 3.5 5.4 3.5 9s-1 6.6-3.5 9c-2.5-2.4-3.5-5.4-3.5-9s1-6.6 3.5-9Z"
        />
      </svg>

      <input
        v-model="domain"
        type="text"
        placeholder="example.com"
        autocomplete="off"
        class="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
    </div>

    <button
      type="submit"
      :disabled="loading || !domain.trim()"
      class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        v-if="!loading"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          d="M12 5v14M5 12h14"
        />
      </svg>

      <svg
        v-else
        class="h-4 w-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          class="opacity-25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
        />
      </svg>

      {{ loading ? 'Verifying...' : 'Add domain' }}
    </button>
  </form>
</div>

<!-- Error -->
<div
  v-if="error"
  class="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
>
  <svg
    class="mt-0.5 h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <circle cx="12" cy="12" r="9" />
    <path
      stroke-linecap="round"
      d="M12 8v4M12 16h.01"
    />
  </svg>

  <span>{{ error }}</span>
</div>

<!-- Loading -->
<div
  v-if="loadingDomains"
  class="space-y-3"
>
  <div
    v-for="item in 3"
    :key="item"
    class="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
  />
</div>

<!-- Empty state -->
<div
  v-else-if="domains.length === 0"
  class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
>
  <div
    class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"
  >
    <svg
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        stroke-linecap="round"
        d="M3 12h18M12 3c2.5 2.4 3.5 5.4 3.5 9s-1 6.6-3.5 9c-2.5-2.4-3.5-5.4-3.5-9s1-6.6 3.5-9Z"
      />
    </svg>
  </div>

  <h2 class="mt-4 text-base font-semibold text-slate-900">
    No domains yet
  </h2>

  <p class="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
    Add a domain from your MXroute account to start creating aliases.
  </p>
</div>

<!-- Domain list -->
<div
  v-else
  class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
>
  <div
    class="border-b border-slate-100 bg-slate-50/70 px-6 py-3"
  >
    <p
      class="text-xs font-semibold uppercase tracking-wider text-slate-500"
    >
      Connected domains
    </p>
  </div>

  <div class="divide-y divide-slate-100">
    <div
      v-for="item in domains"
      :key="item.id"
      class="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              stroke-linecap="round"
              d="M3 12h18M12 3c2.5 2.4 3.5 5.4 3.5 9s-1 6.6-3.5 9-3.5-5.4-3.5-9S9.5 5.4 12 3Z"
            />
          </svg>
        </div>

        <div class="min-w-0">
          <p
            class="truncate text-sm font-semibold text-slate-900"
          >
            {{ item.domain }}
          </p>

          <div class="mt-1 flex items-center gap-1.5">
            <span
              class="h-1.5 w-1.5 rounded-full bg-emerald-500"
            />

            <span class="text-xs text-slate-500">
              Verified with MXroute
            </span>
          </div>
        </div>
      </div>

      <button
        :disabled="deletingId === item.id"
        class="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        @click="requestDeleteDomain(item)"
      >
        <svg
          v-if="deletingId !== item.id"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
          />
        </svg>

        <svg
          v-else
          class="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            class="opacity-25"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
          />
        </svg>

        {{ deletingId === item.id ? 'Removing...' : 'Remove' }}
      </button>
    </div>
  </div>
</div>

<ConfirmModal
  v-if="domainPendingDeletion"
  title="Remove domain?"
  :message="`You're about to remove ${domainPendingDeletion.domain} from Alias Manager. The domain will remain in your MXroute account.`"
  confirm-text="Remove domain"
  danger
  :loading="deletingId === domainPendingDeletion.id"
  @close="domainPendingDeletion = null"
  @confirm="deleteDomain(domainPendingDeletion)"
/>
  </div>
</template>
