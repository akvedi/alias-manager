<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

interface RecentAlias {
  id: string
  address: string
  destination: string
  enabled: boolean
  createdAt: number
}

interface DashboardData {
  domains: number
  aliases: {
    total: number
    active: number
    disabled: number
  }
  recentAliases: RecentAlias[]
}

const dashboard = ref<DashboardData | null>(null)
const loading = ref(true)
const error = ref('')

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/dashboard')

    if (!response.ok) {
      throw new Error('Failed to load dashboard')
    }

    dashboard.value = await response.json()
  } catch {
    error.value =
      'Could not load your dashboard. Please try again.'
  } finally {
    loading.value = false
  }
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp * 1000))
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="mx-auto w-full max-w-6xl">
    <!-- Header -->
    <div class="mb-8">
      <h1
        class="text-2xl font-semibold tracking-tight text-slate-900"
      >
        Dashboard
      </h1>
  <p class="mt-1 text-sm text-slate-500">
    Here's an overview of your alias setup.
  </p>
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
  v-if="loading"
  class="space-y-6"
>
  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div
      v-for="item in 4"
      :key="item"
      class="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
    />
  </div>

  <div
    class="h-80 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
  />
</div>

<!-- Dashboard -->
<template v-else-if="dashboard">
  <!-- Stats -->
  <div
    class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
  >
    <!-- Domains -->
    <div
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500">
            Domains
          </p>

          <p
            class="mt-3 text-3xl font-semibold tracking-tight text-slate-900"
          >
            {{ dashboard.domains }}
          </p>
        </div>

        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"
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
      </div>

      <RouterLink
        to="/domains"
        class="mt-4 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700"
      >
        Manage domains →
      </RouterLink>
    </div>

    <!-- Total aliases -->
    <div
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500">
            Total aliases
          </p>

          <p
            class="mt-3 text-3xl font-semibold tracking-tight text-slate-900"
          >
            {{ dashboard.aliases.total }}
          </p>
        </div>

        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 7h8m-8 4h5m-9 9 3-3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10l-2 3h1Z"
            />
          </svg>
        </div>
      </div>

      <RouterLink
        to="/aliases"
        class="mt-4 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700"
      >
        View aliases →
      </RouterLink>
    </div>

    <!-- Active aliases -->
    <div
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500">
            Active aliases
          </p>

          <p
            class="mt-3 text-3xl font-semibold tracking-tight text-slate-900"
          >
            {{ dashboard.aliases.active }}
          </p>
        </div>

        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m5 12 4 4L19 6"
            />
          </svg>
        </div>
      </div>

      <p
        class="mt-4 text-xs font-medium text-emerald-600"
      >
        Currently forwarding
      </p>
    </div>

    <!-- Disabled aliases -->
    <div
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500">
            Disabled aliases
          </p>

          <p
            class="mt-3 text-3xl font-semibold tracking-tight text-slate-900"
          >
            {{ dashboard.aliases.disabled }}
          </p>
        </div>

        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              d="M6 6l12 12M18 6 6 18"
            />
          </svg>
        </div>
      </div>

      <p class="mt-4 text-xs font-medium text-slate-500">
        Not currently forwarding
      </p>
    </div>
  </div>

  <!-- Lower section -->
  <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <!-- Recent aliases -->
    <section
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div
        class="flex items-center justify-between border-b border-slate-100 px-6 py-4"
      >
        <div>
          <h2 class="text-sm font-semibold text-slate-900">
            Recent aliases
          </h2>

          <p class="mt-0.5 text-xs text-slate-500">
            Your five most recently created aliases.
          </p>
        </div>

        <RouterLink
          to="/aliases"
          class="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View all
        </RouterLink>
      </div>

      <!-- No aliases -->
      <div
        v-if="dashboard.recentAliases.length === 0"
        class="px-6 py-14 text-center"
      >
        <div
          class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 7h8m-8 4h5m-9 9 3-3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10l-2 3h1Z"
            />
          </svg>
        </div>

        <p
          class="mt-3 text-sm font-medium text-slate-900"
        >
          No aliases yet
        </p>

        <p class="mt-1 text-xs text-slate-500">
          Create your first alias to see it here.
        </p>
      </div>

      <!-- Alias rows -->
      <div
        v-else
        class="divide-y divide-slate-100"
      >
        <div
          v-for="alias in dashboard.recentAliases"
          :key="alias.id"
          class="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50/60"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600"
            >
              @
            </div>

            <div class="min-w-0">
              <p
                class="truncate text-sm font-semibold text-slate-900"
              >
                {{ alias.address }}
              </p>

              <p
                class="mt-0.5 truncate text-xs text-slate-500"
              >
                → {{ alias.destination }}
              </p>
            </div>
          </div>

          <div class="hidden shrink-0 items-end gap-3 sm:flex sm:flex-col">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="
                alias.enabled
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              "
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="
                  alias.enabled
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                "
              />

              {{ alias.enabled ? 'Active' : 'Disabled' }}
            </span>

            <span class="text-[11px] text-slate-400">
              {{ formatDate(alias.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick actions -->
    <section
      class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div class="mb-5">
        <h2 class="text-sm font-semibold text-slate-900">
          Quick actions
        </h2>

        <p class="mt-0.5 text-xs text-slate-500">
          Manage your setup quickly.
        </p>
      </div>

      <div class="space-y-3">
        <RouterLink
          to="/aliases"
          class="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/50"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path
                stroke-linecap="round"
                d="M12 5v14M5 12h14"
              />
            </svg>
          </div>

          <div>
            <p
              class="text-sm font-semibold text-slate-900"
            >
              Create alias
            </p>

            <p class="text-xs text-slate-500">
              Add a new forwarding address
            </p>
          </div>

          <span
            class="ml-auto text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
          >
            →
          </span>
        </RouterLink>

        <RouterLink
          to="/domains"
          class="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/50"
        >
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100"
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

          <div>
            <p
              class="text-sm font-semibold text-slate-900"
            >
              Add domain
            </p>

            <p class="text-xs text-slate-500">
              Connect another MXroute domain
            </p>
          </div>

          <span
            class="ml-auto text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
          >
            →
          </span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>


  </div>
</template>
