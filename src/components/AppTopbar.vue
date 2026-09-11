<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { authClient } from '@/lib/auth-client'

const router = useRouter()

const userEmail = ref('')

async function loadSession() {
  const { data: session } = await authClient.getSession()

  if (session) {
    userEmail.value = session.user.email
  }
}

async function logout() {
  await authClient.signOut()
  await router.push('/login')
}

onMounted(() => {
  loadSession()
})
</script>

<template>
  <header
    class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8"
  >
    <span class="text-lg font-semibold text-gray-900">
      Alias Manager
    </span>

    <div class="flex items-center gap-4">
      <span
        v-if="userEmail"
        class="text-sm text-gray-600 font-bold"
      >
        👨🏽 {{ userEmail }}
      </span>

      <button
        class="rounded-md border border-gray-300 bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-300 hover:text-gray-700 cursor-pointer"
        @click="logout"
      >
        Logout
      </button>
    </div>
  </header>
</template>
