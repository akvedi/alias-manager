<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Destination {
  id: string
  email: string
  label: string
  createdAt: number
}

const destinations = ref<Destination[]>([])

const loading = ref(true)
const saving = ref(false)
const deletingId = ref<string | null>(null)
const editingId = ref<string | null>(null)

const error = ref('')
const formError = ref('')

const showAddForm = ref(false)

const label = ref('')
const email = ref('')

const editLabel = ref('')
const editEmail = ref('')

async function loadDestinations() {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch('/api/destinations')

    if (!response.ok) {
      throw new Error('Failed to load destinations')
    }

    destinations.value = await response.json()
  } catch {
    error.value =
      'Could not load your saved destinations.'
  } finally {
    loading.value = false
  }
}

function openAddForm() {
  label.value = ''
  email.value = ''
  formError.value = ''
  showAddForm.value = true
}

function closeAddForm() {
  showAddForm.value = false
  formError.value = ''
}

async function addDestination() {
  const cleanLabel = label.value.trim()
  const cleanEmail = email.value.trim().toLowerCase()

  if (!cleanLabel || !cleanEmail) {
    formError.value = 'Label and email are required.'
    return
  }

  saving.value = true
  formError.value = ''

  try {
    const response = await fetch('/api/destinations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        label: cleanLabel,
        email: cleanEmail,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not save destination.',
      )
    }

    closeAddForm()
    await loadDestinations()
  } catch (err) {
    formError.value =
      err instanceof Error
        ? err.message
        : 'Could not save destination.'
  } finally {
    saving.value = false
  }
}

function startEditing(destination: Destination) {
  editingId.value = destination.id
  editLabel.value = destination.label
  editEmail.value = destination.email
  error.value = ''
}

function cancelEditing() {
  editingId.value = null
  editLabel.value = ''
  editEmail.value = ''
}

async function saveDestination(destinationId: string) {
  const cleanLabel = editLabel.value.trim()
  const cleanEmail = editEmail.value.trim().toLowerCase()

  if (!cleanLabel || !cleanEmail) {
    error.value = 'Label and email are required.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const response = await fetch(
      `/api/destinations/${destinationId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: cleanLabel,
          email: cleanEmail,
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not update destination.',
      )
    }

    cancelEditing()
    await loadDestinations()
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Could not update destination.'
  } finally {
    saving.value = false
  }
}

async function deleteDestination(id: string) {
  deletingId.value = id
  error.value = ''

  try {
    const response = await fetch(
      `/api/destinations/${id}`,
      {
        method: 'DELETE',
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not delete destination.',
      )
    }

    await loadDestinations()
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Could not delete destination.'
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  loadDestinations()
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
        Manage your saved destinations and account preferences.
      </p>
    </div>

    <!-- Saved destinations -->
    <section
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <!-- Section header -->
      <div
        class="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5"
      >
        <div>
          <h2 class="text-base font-semibold text-slate-900">
            Saved destinations
          </h2>

          <p class="mt-1 text-sm text-slate-500">
            Reusable email addresses for your aliases.
          </p>
        </div>

        <button
          v-if="!showAddForm && !editingId"
          type="button"
          class="shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          @click="openAddForm"
        >
          Add destination
        </button>
      </div>

      <!-- Add form -->
      <div
        v-if="showAddForm"
        class="border-b border-slate-200 bg-slate-50 px-6 py-5"
      >
        <h3 class="text-sm font-semibold text-slate-900">
          Add saved destination
        </h3>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              for="destination-label"
              class="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Label
            </label>

            <input
              id="destination-label"
              v-model="label"
              type="text"
              placeholder="Personal"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label
              for="destination-email"
              class="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Email address
            </label>

            <input
              id="destination-email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <p
          v-if="formError"
          class="mt-3 text-sm text-red-600"
        >
          {{ formError }}
        </p>

        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            :disabled="saving"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-50"
            @click="closeAddForm"
          >
            Cancel
          </button>

          <button
            type="button"
            :disabled="saving"
            class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="addDestination"
          >
            {{ saving ? 'Saving...' : 'Save destination' }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="divide-y divide-slate-100">
        <div
          v-for="item in 3"
          :key="item"
          class="flex items-center justify-between px-6 py-5"
        >
          <div class="space-y-2">
            <div class="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div class="h-3 w-40 animate-pulse rounded bg-slate-100" />
          </div>

          <div class="h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="destinations.length === 0"
        class="px-6 py-12 text-center"
      >
        <div
          class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m7 8 5 4 5-4"
            />
          </svg>
        </div>

        <p class="mt-4 text-sm font-medium text-slate-700">
          No saved destinations
        </p>

        <p class="mt-1 text-sm text-slate-500">
          Add an email address to quickly reuse it when creating aliases.
        </p>
      </div>

      <!-- List -->
      <div
        v-else
        class="divide-y divide-slate-100"
      >
        <div
          v-for="destination in destinations"
          :key="destination.id"
          class="px-6 py-4"
        >
          <!-- Normal row -->
          <div
            v-if="editingId !== destination.id"
            class="flex items-center justify-between gap-4"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-900">
                {{ destination.label }}
              </p>

              <p class="mt-0.5 truncate text-sm text-slate-500">
                {{ destination.email }}
              </p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <button
                type="button"
                :disabled="editingId !== null || deletingId !== null"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                @click="startEditing(destination)"
              >
                Edit
              </button>

              <button
                type="button"
                :disabled="deletingId === destination.id || editingId !== null"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                @click="deleteDestination(destination.id)"
              >
                {{
                  deletingId === destination.id
                    ? 'Deleting...'
                    : 'Delete'
                }}
              </button>
            </div>
          </div>

          <!-- Edit row -->
          <div
            v-else
            class="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4"
          >
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  :for="`edit-label-${destination.id}`"
                  class="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Label
                </label>

                <input
                  :id="`edit-label-${destination.id}`"
                  v-model="editLabel"
                  type="text"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  @keyup.enter="saveDestination(destination.id)"
                />
              </div>

              <div>
                <label
                  :for="`edit-email-${destination.id}`"
                  class="mb-1.5 block text-xs font-medium text-slate-600"
                >
                  Email address
                </label>

                <input
                  :id="`edit-email-${destination.id}`"
                  v-model="editEmail"
                  type="email"
                  class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  @keyup.enter="saveDestination(destination.id)"
                />
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
              <button
                type="button"
                :disabled="saving"
                class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-50"
                @click="cancelEditing"
              >
                Cancel
              </button>

              <button
                type="button"
                :disabled="saving"
                class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                @click="saveDestination(destination.id)"
              >
                {{ saving ? 'Saving...' : 'Save changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer info -->
      <div
        v-if="destinations.length > 0"
        class="border-t border-slate-200 bg-slate-50 px-6 py-4"
      >
        <p class="text-xs leading-relaxed text-slate-500">
          Deleting or editing a saved destination does not affect aliases that
          already use that email address.
        </p>
      </div>
    </section>
  </div>
</template>
