import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '@/views/DashboardView.vue'
import AliasesView from '@/views/AliasesView.vue'
import DomainsView from '@/views/DomainsView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/aliases',
      name: 'aliases',
      component: AliasesView,
    },
    {
      path: '/domains',
      name: 'domains',
      component: DomainsView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

export default router