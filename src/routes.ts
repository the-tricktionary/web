import { getAnalytics, logEvent } from '@firebase/analytics'
import { getAuth } from '@firebase/auth'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Only signed in users may visit this route, others are sent to sign in */
    requiresAuth?: boolean
  }
}

const analytics = getAnalytics()

export const routes: RouteRecordRaw[] = [
  { name: 'tricktionary', path: '/', component: async () => await import('./views/Home.vue') },
  { name: 'trick', path: '/trick/:discipline/:slug', component: async () => await import('./views/Trick.vue') },

  { name: 'speed', path: '/speed', component: async () => await import('./views/SpeedIndex.vue'), meta: { requiresAuth: true } },
  { name: 'speed-create', path: '/speed/create', component: async () => await import('./views/SpeedCreate.vue'), meta: { requiresAuth: true } },
  { name: 'speed-details', path: '/speed/:id', component: async () => await import('./views/SpeedDetails.vue'), meta: { requiresAuth: true } },

  { name: 'auth', path: '/auth', component: async () => await import('./views/Auth.vue') },
  { name: 'profile', path: '/profile', component: async () => await import('./views/Profile.vue'), meta: { requiresAuth: true } },
  { name: 'policies', path: '/policies', component: async () => await import('./views/Policies.vue') },
  { name: 'shop', path: '/shop', component: async () => await import('./views/Shop.vue') },
  { name: 'shop-success', path: '/shop-success', component: async () => await import('./views/ShopSuccess.vue') },
  { name: 'not_found', path: '/:catchAll(.*)*', component: async () => await import('./views/404.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async to => {
  if (!to.meta.requiresAuth) return true
  const auth = getAuth()
  // Wait for the persisted session to be restored before deciding
  await auth.authStateReady()
  if (auth.currentUser) return true
  return { name: 'auth', query: { redirect: to.fullPath } }
})

// Signing out while on a protected page sends you to the sign in page too
getAuth().onAuthStateChanged(user => {
  if (!user && router.currentRoute.value.meta.requiresAuth) {
    void router.replace({ name: 'auth' })
  }
})

router.afterEach((to) => {
  logEvent(analytics, 'screen_view', {
    firebase_screen: to.name?.toString() ?? '',
    firebase_screen_class: to.name?.toString() ?? ''
  })
})

export default router
