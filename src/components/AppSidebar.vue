<script setup lang="ts">
const navigation = [
  {
    name: 'Dashboard',
    to: '/',
    icon: 'dashboard',
  },
  {
    name: 'Aliases',
    to: '/aliases',
    icon: 'aliases',
  },
  {
    name: 'Domains',
    to: '/domains',
    icon: 'domains',
  },
  {
    name: 'Settings',
    to: '/settings',
    icon: 'settings',
  },
  {
    name: 'Destinations',
    to: '/destinations',
    icon: 'mail',
  },
]
</script>

<template>
  <aside
    class="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-300"
  >
    <!-- Brand -->
    <div class="flex h-16 items-center border-b border-slate-800 px-6">
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
        >
          A
        </div>

        <div>
          <p class="text-sm font-semibold tracking-tight text-white">
            Alias Manager
          </p>

          <p class="text-[11px] text-slate-500">
            Email alias management
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-6">
      <p
        class="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
      >
        Workspace
      </p>

      <div class="space-y-1">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
          active-class="bg-indigo-500/10 text-indigo-400 ring-1 ring-inset ring-indigo-500/20"
          :class="{
            'text-slate-400 hover:bg-slate-900 hover:text-slate-100':
              !(
                $route.path === item.to ||
                $route.path.startsWith(`${item.to}/`)
              ),
          }"
        >
          <!-- Dashboard icon -->
          <svg
            v-if="item.icon === 'dashboard'"
            class="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>

          <!-- Aliases icon -->
          <svg
            v-else-if="item.icon === 'aliases'"
            class="h-5 w-5 shrink-0"
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

          <!-- Domains icon -->
          <svg
            v-else-if="item.icon === 'domains'"
            class="h-5 w-5 shrink-0"
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

          <!-- Mail icon -->
          <svg v-else-if="item.icon === 'mail'"
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m5 7 7 5 7-5"
            />
          </svg>

          <!-- Settings icon -->
          <svg
            v-else
            class="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M10.3 3.1h3.4l.6 2.2a7.5 7.5 0 0 1 1.8 1l2.1-.8 2.4 2.4-.8 2.1a7.5 7.5 0 0 1 0 2l.8 2.1-2.4 2.4-2.1-.8a7.5 7.5 0 0 1-1.8 1l-.6 2.2h-3.4l-.6-2.2a7.5 7.5 0 0 1-1.8-1l-2.1.8-2.4-2.4.8-2.1a7.5 7.5 0 0 1 0-2l-.8-2.1 2.4-2.4 2.1.8a7.5 7.5 0 0 1 1.8-1l.6-2.2Z"
            />
            <circle cx="12" cy="12" r="2.5" />
          </svg>

          <span>{{ item.name }}</span>

          <span
            class="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 opacity-0 transition-opacity group-[.router-link-active]:opacity-100"
          />
        </RouterLink>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-slate-800 p-4">
      <div
        class="rounded-lg bg-slate-900/70 px-3 py-3 ring-1 ring-inset ring-slate-800"
      >
        <p class="text-xs font-medium text-slate-300">
          Alias Manager
        </p>

        <p class="mt-1 text-[11px] leading-relaxed text-slate-500">
          Manage your email aliases in one place.
        </p>
      </div>
    </div>
  </aside>
</template>
