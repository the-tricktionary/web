import { getAnalytics, logEvent } from '@firebase/analytics'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const analytics = getAnalytics()

export const routes: RouteRecordRaw[] = [
  { name: 'tricktionary', path: '/', component: async () => await import('./views/Home.vue') },
  { name: 'trick', path: '/trick/:discipline/:slug', component: async () => await import('./views/Trick.vue') },
  { name: 'auth', path: '/auth', component: async () => await import('./views/Auth.vue') },
  { name: 'profile', path: '/profile', component: async () => await import('./views/Profile.vue') },
  { name: 'policies', path: '/policies', component: async () => await import('./views/Policies.vue') },
  { name: 'shop', path: '/shop', component: async () => await import('./views/Shop.vue') },
  { name: 'shop-success', path: '/shop-success', component: async () => await import('./views/ShopSuccess.vue') },
  { name: 'not_found', path: '/:catchAll(.*)*', component: async () => await import('./views/404.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  logEvent(analytics, 'screen_view', {
    firebase_screen: to.name?.toString() ?? '',
    firebase_screen_class: to.name?.toString() ?? ''
  })
})

export default router
