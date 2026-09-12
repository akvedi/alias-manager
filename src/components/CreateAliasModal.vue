<script setup lang="ts">
import { onMounted, ref } from 'vue'

import DestinationPicker from '@/components/DestinationPicker.vue'

interface Domain {
  id: string
  domain: string
}

const props = defineProps<{
  error?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [
    address: string,
    destination: string,
    rejectWhenDisabled: boolean,
    note: string,
  ]
}>()

const localPart = ref('')
const selectedDomain = ref('')
const destination = ref('')
const rejectWhenDisabled = ref(false)
const note = ref('')

const domains = ref<Domain[]>([])
const loadingDomains = ref(true)
const error = ref('')

async function loadDomains() {
  loadingDomains.value = true
  error.value = ''

  try {
    const response = await fetch('/api/domains')

    if (!response.ok) {
      throw new Error('Failed to load domains')
    }

    domains.value = await response.json()

    const firstDomain = domains.value[0]

    if (firstDomain) {
      selectedDomain.value = firstDomain.domain
    }
  } catch {
    error.value = 'Could not load your domains.'
  } finally {
    loadingDomains.value = false
  }
}

function closeModal() {
  emit('close')
}

function createAlias() {
  if (!localPart.value.trim() || !selectedDomain.value) {
    return
  }

  if (!destination.value.trim()) {
    return
  }

  const address = `${localPart.value.trim()}@${selectedDomain.value}`

  emit(
    'create',
    address,
    destination.value.trim(),
    rejectWhenDisabled.value,
    note.value.trim(),
  )
}

onMounted(() => {
  loadDomains()
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
    @click.self="!props.loading && closeModal()"
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-slate-950/20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-alias-title"
    >
      <!-- Header -->
      <div class="border-b border-slate-200 px-6 py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2
              id="create-alias-title"
              class="text-lg font-semibold text-slate-900"
            >
              Create alias
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Create a new email alias for your domain.
            </p>
          </div>

          <button
            type="button"
            :disabled="props.loading"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
            @click="closeModal"
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
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="space-y-6 px-6 py-6">
        <!-- Error -->
        <div
          v-if="error || props.error"
          class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <svg
            class="mt-0.5 h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              stroke-linecap="round"
              d="M12 8v5m0 3h.01"
            />
          </svg>

          <span>{{ props.error || error }}</span>
        </div>

        <!-- Alias -->
        <div>
          <label
            for="local-part"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Alias address
          </label>

          <div class="flex items-center">
            <input
              id="local-part"
              v-model="localPart"
              type="text"
              placeholder="github"
              autocomplete="off"
              :disabled="props.loading"
              class="min-w-0 flex-1 rounded-l-lg border border-r-0 border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <div
              class="flex h-[42px] items-center rounded-r-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-500"
            >
              @
            </div>

            <div class="ml-2 w-48">
              <div
                v-if="loadingDomains"
                class="h-[42px] animate-pulse rounded-lg bg-slate-100"
              />

              <select
                v-else
                v-model="selectedDomain"
                :disabled="props.loading"
                class="h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option
                  v-for="item in domains"
                  :key="item.id"
                  :value="item.domain"
                >
                  {{ item.domain }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Destination -->
        <DestinationPicker
          v-model:destination="destination"
        />

        <!-- Disabled behavior -->
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <label
            class="flex cursor-pointer items-start gap-3"
            :class="props.loading ? 'cursor-not-allowed opacity-60' : ''"
          >
            <input
              v-model="rejectWhenDisabled"
              type="checkbox"
              :disabled="props.loading"
              class="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed"
            />

            <span>
              <span
                class="block text-sm font-medium text-slate-800"
              >
                Reject messages when this alias is disabled
              </span>

              <span
                class="mt-1 block text-xs leading-5 text-slate-500"
              >
                When disabled, reject incoming messages instead of
                silently discarding them.
              </span>
            </span>
          </label>
        </div>

        <!-- Note -->
        <div>
          <label
            for="alias-note"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Note
            <span class="font-normal text-slate-400">
              (optional)
            </span>
          </label>

          <textarea
            id="alias-note"
            v-model="note"
            rows="3"
            maxlength="500"
            :disabled="props.loading"
            placeholder="What is this alias used for?"
            class="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <p class="mt-1.5 text-xs text-slate-400">
            This note is stored only in Alias Manager.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"
      >
        <button
          type="button"
          :disabled="props.loading"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          @click="closeModal"
        >
          Cancel
        </button>

        <button
          type="button"
          :disabled="
            props.loading ||
            !localPart.trim() ||
            !selectedDomain ||
            !destination.trim()
          "
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="createAlias"
        >
          <svg
            v-if="props.loading"
            class="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              stroke-width="3"
            />

            <path
              class="opacity-90"
              d="M21 12a9 9 0 0 1-9 9"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>

          {{ props.loading ? 'Creating alias...' : 'Create alias' }}
        </button>
      </div>
    </div>
  </div>
</template>
