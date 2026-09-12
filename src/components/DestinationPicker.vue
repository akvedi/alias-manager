<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface Destination {
  id: string
  email: string
  label: string
}

const props = defineProps<{
  destination: string
}>()

const emit = defineEmits<{
  'update:destination': [value: string]
}>()

const destinations = ref<Destination[]>([])
const loading = ref(true)
const error = ref('')
const showAddForm = ref(false)

const newLabel = ref('')
const newEmail = ref('')
const saving = ref(false)
const saveError = ref('')

const availableDestinations = computed(() => {
  if (
    !props.destination ||
    destinations.value.some(
      (item) => item.email === props.destination,
    )
  ) {
    return destinations.value
  }

  return [
    {
      id: '__current__',
      email: props.destination,
      label: 'Current destination',
    },
    ...destinations.value,
  ]
})

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
    error.value = 'Could not load saved destinations.'
  } finally {
    loading.value = false
  }
}

function selectDestination(email: string) {
  emit('update:destination', email)
}

function openAddForm() {
  newLabel.value = ''
  newEmail.value = ''
  saveError.value = ''
  showAddForm.value = true
}

function closeAddForm() {
  showAddForm.value = false
  saveError.value = ''
}

async function saveDestination() {
  const label = newLabel.value.trim()
  const email = newEmail.value.trim().toLowerCase()

  if (!label || !email) {
    saveError.value = 'Label and email are required.'
    return
  }

  saving.value = true
  saveError.value = ''

  try {
    const response = await fetch('/api/destinations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        label,
        email,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not save destination.',
      )
    }

    await loadDestinations()

    selectDestination(email)
    closeAddForm()
  } catch (err) {
    saveError.value =
      err instanceof Error
        ? err.message
        : 'Could not save destination.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadDestinations()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Destination -->
    <div>
      <label
        for="destination"
        class="mb-2 block text-sm font-medium text-slate-700"
      >
        Destination email
      </label>

      <div
        v-if="loading"
        class="h-11 animate-pulse rounded-lg bg-slate-100"
      />

      <select
        v-else-if="destinations.length > 0 && !showAddForm"
        id="destination"
        :value="destination"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        @change="
          selectDestination(
            ($event.target as HTMLSelectElement).value,
          )
        "
      >
        <option value="" disabled>
          Select a destination
        </option>

        <option
          v-for="item in availableDestinations"
          :key="item.id"
          :value="item.email"
        >
          {{ item.label }} · {{ item.email }}
        </option>
      </select>

      <div
        v-else-if="!showAddForm"
        class="rounded-lg border border-dashed border-slate-300 px-4 py-4 text-center"
      >
        <p class="text-sm font-medium text-slate-700">
          No saved destinations yet
        </p>

        <p class="mt-1 text-xs text-slate-500">
          Add one below to use it for this alias.
        </p>
      </div>

      <p
        v-if="error"
        class="mt-2 text-xs text-red-600"
      >
        {{ error }}
      </p>

      <button
        v-if="!showAddForm"
        type="button"
        class="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        @click="openAddForm"
      >
        + Add new destination
      </button>

      <!-- Add destination -->
      <div
        v-if="showAddForm"
        class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              class="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Label
            </label>

            <input
              v-model="newLabel"
              type="text"
              placeholder="Personal"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label
              class="mb-1.5 block text-xs font-medium text-slate-600"
            >
              Email
            </label>

            <input
              v-model="newEmail"
              type="email"
              placeholder="you@example.com"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <p
          v-if="saveError"
          class="mt-2 text-xs text-red-600"
        >
          {{ saveError }}
        </p>

        <div class="mt-3 flex justify-end gap-2">
          <button
            type="button"
            :disabled="saving"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            @click="closeAddForm"
          >
            Cancel
          </button>

          <button
            type="button"
            :disabled="saving"
            class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            @click="saveDestination"
          >
            {{ saving ? 'Saving...' : 'Save destination' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
