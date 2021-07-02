import { getAnalytics, logEvent, setCurrentScreen } from '@firebase/analytics'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const analytics = getAnalytics()

export const routes: RouteRecordRaw[] = [
  { name: 'tricktionary', path: '/', component: () => import('./views/Home.vue') },
  { name: 'trick', path: '/trick/:discipline/:slug', component: () => import('./views/Trick.vue') },
  { name: 'auth', path: '/auth', component: () => import('./views/Auth.vue') },
  { name: 'profile', path: '/profile', component: () => import('./views/Profile.vue') },
  { name: 'rafiki', path: '/rafiki', component: () => import('./views/Rafiki.vue') },
  { name: 'policies', path: '/policies', component: () => import('./views/Policies.vue') },
  { name: 'shop', path: '/shop', component: () => import('./views/Shop.vue') },
  { name: 'not_found', path: '/:catchAll(.*)*', component: () => import('./views/404.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  setCurrentScreen(analytics, to.name?.toString() ?? '')
  logEvent(analytics, 'screen_view')
})

export default router
