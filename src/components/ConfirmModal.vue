<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`${title}-title`"
    >
      <!-- Icon -->
      <div class="px-6 pt-6">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-xl"
          :class="
            danger
              ? 'bg-red-50 text-red-600'
              : 'bg-indigo-50 text-indigo-600'
          "
        >
          <svg
            v-if="danger"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v4m0 4h.01M10.3 3.1h3.4L21 17.7a1.5 1.5 0 0 1-1.3 2.3H4.3A1.5 1.5 0 0 1 3 17.7L10.3 3.1Z"
            />
          </svg>

      <svg
        v-else
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          stroke-linecap="round"
          d="M12 11v5M12 8h.01"
        />
      </svg>
    </div>
  </div>

  <!-- Content -->
  <div class="px-6 pb-6 pt-4">
    <h2
      :id="`${title}-title`"
      class="text-lg font-semibold tracking-tight text-slate-900"
    >
      {{ title }}
    </h2>

    <p
      class="mt-2 text-sm leading-6 text-slate-500"
    >
      {{ message }}
    </p>
  </div>

  <!-- Actions -->
  <div
    class="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4"
  >
    <button
      type="button"
      :disabled="loading"
      class="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/30 disabled:cursor-not-allowed disabled:opacity-50"
      @click="emit('close')"
    >
      {{ cancelText ?? 'Cancel' }}
    </button>

    <button
      type="button"
      :disabled="loading"
      class="rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      :class="
        danger
          ? 'bg-red-600 shadow-red-600/20 hover:bg-red-700 focus:ring-red-500'
          : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700 focus:ring-indigo-500'
      "
      @click="emit('confirm')"
    >
      {{ loading ? 'Working...' : confirmText ?? 'Confirm' }}
    </button>
  </div>
</div>

  </div>
</template>
