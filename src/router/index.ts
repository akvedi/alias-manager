import { createRouter, createWebHistory } from 'vue-router'

import { authClient } from '@/lib/auth-client'

import AppLayout from '@/layouts/AppLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import AliasesView from '@/views/AliasesView.vue'
import DomainsView from '@/views/DomainsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DestinationsView from '@/views/DestinationsView.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },

    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },

    {
      path: '/',
      component: AppLayout,

      meta: {
        requiresAuth: true,
      },

      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
        },

        {
          path: 'aliases',
          name: 'aliases',
          component: AliasesView,
        },

        {
          path: 'domains',
          name: 'domains',
          component: DomainsView,
        },

        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
        },

        {
          path: 'destinations',
          name: 'destinations',
          component: DestinationsView,
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    return true
  }

  const { data: session } = await authClient.getSession()

  if (!session) {
    return {
      name: 'login',
    }
  }

  return true
})

export default router
