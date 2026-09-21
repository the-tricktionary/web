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
  { name: 'speed-count', path: '/speed/count', component: async () => await import('./views/SpeedCount.vue'), meta: { requiresAuth: true } },
  { name: 'speed-compare', path: '/speed/compare', component: async () => await import('./views/SpeedCompare.vue'), meta: { requiresAuth: true } },
  { name: 'speed-progress', path: '/speed/progress', component: async () => await import('./views/SpeedProgress.vue'), meta: { requiresAuth: true } },
  { name: 'speed-details', path: '/speed/:id', component: async () => await import('./views/SpeedDetails.vue'), meta: { requiresAuth: true } },

  { name: 'groups', path: '/groups', component: async () => await import('./views/GroupsIndex.vue'), meta: { requiresAuth: true } },
  { name: 'groups-create', path: '/groups/create', component: async () => await import('./views/GroupCreate.vue'), meta: { requiresAuth: true } },
  // declared before /groups/:id, or a join link matches as a group id
  { name: 'groups-join', path: '/groups/join/:code?', component: async () => await import('./views/GroupJoin.vue'), meta: { requiresAuth: true } },
  {
    path: '/groups/:id',
    component: async () => await import('./views/GroupPage.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: to => ({ name: 'group-tricks', params: to.params }) },
      { name: 'group-tricks', path: 'tricks', component: async () => await import('./views/GroupTricks.vue') },
      { name: 'group-speed', path: 'speed', component: async () => await import('./views/GroupSpeed.vue') },
      { name: 'group-analysis', path: 'analysis', component: async () => await import('./views/GroupSpeedAnalysis.vue') },
      { name: 'group-bests', path: 'bests', component: async () => await import('./views/GroupSpeedBests.vue') },
      { name: 'group-members', path: 'members', component: async () => await import('./views/GroupMembers.vue') }
    ]
  },

  { name: 'auth', path: '/auth', component: async () => await import('./views/Auth.vue') },
  { name: 'profile', path: '/profile', component: async () => await import('./views/Profile.vue'), meta: { requiresAuth: true } },
  { name: 'profile-user', path: '/profile/:usernameOrId', component: async () => await import('./views/Profile.vue') },
  { name: 'settings', path: '/settings', component: async () => await import('./views/Settings.vue'), meta: { requiresAuth: true } },
  { name: 'policies', path: '/policies', component: async () => await import('./views/Policies.vue') },
  { name: 'shop', path: '/shop', component: async () => await import('./views/Shop.vue') },
  { name: 'booklets', path: '/booklets', component: async () => await import('./views/Booklets.vue') },
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
