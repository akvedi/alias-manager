<script setup lang="ts">
import { ref } from 'vue'

import DestinationPicker from '@/components/DestinationPicker.vue'

const props = defineProps<{
  alias: {
    id: string
    address: string
    destination: string | null
    disabledBehavior: 'blackhole' | 'reject'
    note: string | null
  }
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const destination = ref(
  props.alias.destination ?? '',
)

const rejectWhenDisabled = ref(
  props.alias.disabledBehavior === 'reject',
)

const note = ref(props.alias.note ?? '')

const saving = ref(false)
const error = ref('')

async function saveChanges() {
  if (!destination.value.trim()) {
    error.value = 'Please select a destination email.'
    return
  }

  if (note.value.length > 500) {
    error.value = 'Note must be 500 characters or less.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const response = await fetch(
      `/api/aliases/${props.alias.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination.value.trim(),
          rejectWhenDisabled:
            rejectWhenDisabled.value,
          note: note.value.trim(),
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.error || 'Could not update alias.',
      )
    }

    emit('saved')
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'Could not update alias.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
    @click.self="!saving && emit('close')"
  >
    <div
      class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-slate-950/20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-alias-title"
    >
      <!-- Header -->
      <div class="border-b border-slate-200 px-6 py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2
              id="edit-alias-title"
              class="text-lg font-semibold text-slate-900"
            >
              Edit alias
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              Update where this alias forwards email and what
              happens when it is disabled.
            </p>
          </div>

          <button
            type="button"
            :disabled="saving"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
            @click="emit('close')"
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
        <!-- Alias address -->
        <div>
          <label
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Alias address
          </label>

          <div
            class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <span
              class="text-sm font-medium text-slate-900"
            >
              {{ alias.address }}
            </span>

            <span
              class="flex items-center gap-1.5 text-xs text-slate-400"
            >
              <svg
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                />
                <path
                  stroke-linecap="round"
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                />
              </svg>

              Cannot be changed
            </span>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
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

          <span>{{ error }}</span>
        </div>

        <!-- Destination -->
        <DestinationPicker
          v-model:destination="destination"
        />

        <p class="-mt-3 text-xs text-slate-400">
          Email will be forwarded here when the alias is enabled.
        </p>

        <!-- Disabled behavior -->
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <label
            class="flex cursor-pointer items-start gap-3"
            :class="
              saving
                ? 'cursor-not-allowed opacity-60'
                : ''
            "
          >
            <input
              v-model="rejectWhenDisabled"
              type="checkbox"
              :disabled="saving"
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
                When disabled, reject incoming messages instead
                of silently discarding them.
              </span>
            </span>
          </label>
        </div>

        <!-- Note -->
        <div>
          <label
            for="edit-alias-note"
            class="mb-2 block text-sm font-medium text-slate-700"
          >
            Note
            <span class="font-normal text-slate-400">
              (optional)
            </span>
          </label>

          <textarea
            id="edit-alias-note"
            v-model="note"
            rows="4"
            maxlength="500"
            placeholder="What is this alias used for?"
            class="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />

          <div class="mt-1.5 flex items-center justify-between">
            <p class="text-xs text-slate-400">
              This note is stored only in Alias Manager.
            </p>

            <span class="text-xs text-slate-400">
              {{ note.length }}/500
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"
      >
        <button
          type="button"
          :disabled="saving"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          @click="emit('close')"
        >
          Cancel
        </button>

        <button
          type="button"
          :disabled="saving || !destination.trim()"
          class="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="saveChanges"
        >
          {{ saving ? 'Saving changes...' : 'Save changes' }}
        </button>
      </div>
    </div>
  </div>
</template>
