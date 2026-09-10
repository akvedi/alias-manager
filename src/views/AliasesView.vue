<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CreateAliasModal from '@/components/CreateAliasModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

interface Alias {
  id: string
  address: string
  destination: string
  enabled: boolean
}

const aliases = ref<Alias[]>([])

const showCreateModal = ref(false)
const loading = ref(true)
const actionId = ref<string | null>(null)
const aliasPendingDeletion = ref<Alias | null>(null)
const error = ref('')

async function loadAliases() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/aliases')

    if (!response.ok) {
      throw new Error('Failed to load aliases')
    }

    aliases.value = await response.json()
  } catch {
    error.value = 'Could not load your aliases. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAliases()
})

async function toggleAlias(alias: Alias) {
  const action = alias.enabled ? 'disable' : 'enable'

  actionId.value = alias.id
  error.value = ''

  try {
    const response = await fetch(
      `/api/aliases/${alias.id}/${action}`,
      {
        method: 'POST',
      },
    )

    if (!response.ok) {
      const result = await response.json().catch(() => null)

      throw new Error(
        result?.error ?? `Failed to ${action} alias`,
      )
    }

    await loadAliases()
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : `Failed to ${action} alias`
  } finally {
    actionId.value = null
  }
}

function requestDeleteAlias(alias: Alias) {
  aliasPendingDeletion.value = alias
}

async function deleteAlias(alias: Alias) {
  actionId.value = alias.id
  error.value = ''

  try {
    const response = await fetch(
      `/api/aliases/${alias.id}`,
      {
        method: 'DELETE',
      },
    )

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        result?.error ?? 'Failed to delete alias',
      )
    }

    await loadAliases()
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Failed to delete alias'
  } finally {
    actionId.value = null
    aliasPendingDeletion.value = null
  }
}

function openCreateModal() {
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

async function createAlias(
  address: string,
  destination: string,
) {
  error.value = ''

  try {
    const response = await fetch('/api/aliases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        destination,
      }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        result?.error ?? 'Failed to create alias',
      )
    }

    await loadAliases()

    showCreateModal.value = false
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Failed to create alias'
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-5xl">
    <!-- Header -->
    <div
      class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
            Aliases
          </h1>
      <span
        v-if="!loading"
        class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
      >
        {{ aliases.length }}
      </span>
    </div>

    <p class="mt-1 text-sm text-slate-500">
      Create and manage your email aliases.
    </p>
  </div>

  <button
    class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    @click="openCreateModal"
  >
    <svg
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

    Create alias
  </button>
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
  class="space-y-3"
>
  <div
    v-for="item in 3"
    :key="item"
    class="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
  />
</div>

<!-- Empty state -->
<div
  v-else-if="aliases.length === 0"
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
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M8 7h8m-8 4h5m-9 9 3-3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10l-2 3h1Z"
      />
    </svg>
  </div>

  <h2 class="mt-4 text-base font-semibold text-slate-900">
    No aliases yet
  </h2>

  <p class="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
    Create your first alias to start managing your email addresses.
  </p>

  <button
    class="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
    @click="openCreateModal"
  >
    Create your first alias
  </button>
</div>

<!-- Alias list -->
<div
  v-else
  class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
>
  <div
    class="hidden grid-cols-[minmax(0,1fr)_auto] gap-6 border-b border-slate-100 bg-slate-50/70 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:grid"
  >
    <span>Alias</span>
    <span>Actions</span>
  </div>

  <div class="divide-y divide-slate-100">
    <div
      v-for="alias in aliases"
      :key="alias.id"
      class="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/60 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-6"
    >
      <!-- Alias information -->
      <div class="min-w-0">
        <div class="flex items-center gap-3">
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
              class="mt-0.5 truncate text-sm text-slate-500"
            >
              Forwarding to {{ alias.destination }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between gap-3 sm:justify-end">
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

        <div class="flex items-center gap-2">
          <button
            :disabled="actionId === alias.id"
            class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            @click="toggleAlias(alias)"
          >
            {{
              actionId === alias.id
                ? 'Working...'
                : alias.enabled
                  ? 'Disable'
                  : 'Enable'
            }}
          </button>

          <button
            :disabled="actionId === alias.id"
            class="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Delete alias"
            @click="requestDeleteAlias(alias)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Create modal -->
<CreateAliasModal
  v-if="showCreateModal"
  @close="closeCreateModal"
  @create="createAlias"
/>

<ConfirmModal
  v-if="aliasPendingDeletion"
  title="Delete alias?"
  :message="`You're about to permanently delete ${aliasPendingDeletion.address}. This action cannot be undone.`"
  confirm-text="Delete alias"
  danger
  :loading="actionId === aliasPendingDeletion.id"
  @close="aliasPendingDeletion = null"
  @confirm="deleteAlias(aliasPendingDeletion)"
/>
  </div>
</template>
