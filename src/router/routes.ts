import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'library', component: () => import('@/pages/LibraryPage.vue') },
      { path: 'import', name: 'import', component: () => import('@/pages/ImportPage.vue') },
      { path: 'pattern/:id', name: 'pattern', component: () => import('@/pages/PatternPage.vue') },
      { path: 'play/:id', name: 'play', component: () => import('@/pages/PlayPage.vue') },
      { path: 'settings', name: 'settings', component: () => import('@/pages/SettingsPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue')
  }
]

export default routes
