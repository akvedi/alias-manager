<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

type DestinationType = 'forward' | 'fail' | 'blackhole'

interface Destination {
  id: string
  email: string
  label: string
}

const props = withDefaults(
  defineProps<{
    destinationType: DestinationType
    destination: string
  }>(),
  {},
)

const emit = defineEmits<{
  'update:destinationType': [value: DestinationType]
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
    props.destinationType !== 'forward' ||
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
  emit('update:destinationType', 'forward')
}

function selectType(type: DestinationType) {
  emit('update:destinationType', type)

  if (type !== 'forward') {
    emit('update:destination', '')
  }
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
    <!-- Destination type -->
    <div>
      <p class="mb-2 text-sm font-medium text-slate-700">
        Delivery
      </p>

      <div class="grid gap-2 sm:grid-cols-3">
        <!-- Forward -->
        <button
          type="button"
          class="rounded-xl border px-3 py-3 text-left transition"
          :class="
            destinationType === 'forward'
              ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          "
          @click="selectType('forward')"
        >
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 12h16m-6-6 6 6-6 6"
                />
              </svg>
            </span>

            <span>
              <span class="block text-sm font-medium text-slate-900">
                Forward
              </span>
              <span class="block text-xs text-slate-500">
                Send to an email
              </span>
            </span>
          </div>
        </button>

        <!-- Fail -->
        <button
          type="button"
          class="rounded-xl border px-3 py-3 text-left transition"
          :class="
            destinationType === 'fail'
              ? 'border-amber-300 bg-amber-50 ring-1 ring-amber-200'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          "
          @click="selectType('fail')"
        >
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 9v4m0 4h.01M10.3 3.6 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"
                />
              </svg>
            </span>

            <span>
              <span class="block text-sm font-medium text-slate-900">
                Reject
              </span>
              <span class="block text-xs text-slate-500">
                Reject incoming mail
              </span>
            </span>
          </div>
        </button>

        <!-- Blackhole -->
        <button
          type="button"
          class="rounded-xl border px-3 py-3 text-left transition"
          :class="
            destinationType === 'blackhole'
              ? 'border-slate-400 bg-slate-100 ring-1 ring-slate-300'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          "
          @click="selectType('blackhole')"
        >
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-600"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <circle cx="12" cy="12" r="8" />
                <path
                  stroke-linecap="round"
                  d="M8.5 8.5 15.5 15.5"
                />
              </svg>
            </span>

            <span>
              <span class="block text-sm font-medium text-slate-900">
                Blackhole
              </span>
              <span class="block text-xs text-slate-500">
                Silently discard mail
              </span>
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Forward destination -->
    <div v-if="destinationType === 'forward'">
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
            <label class="mb-1.5 block text-xs font-medium text-slate-600">
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
            <label class="mb-1.5 block text-xs font-medium text-slate-600">
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
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900"
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

    <!-- Explanation -->
    <div
      v-else-if="destinationType === 'fail'"
      class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      Incoming messages will be rejected instead of being delivered.
    </div>

    <div
      v-else-if="destinationType === 'blackhole'"
      class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
    >
      Incoming messages will be silently discarded without being
      delivered.
    </div>
  </div>
</template>
