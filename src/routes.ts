import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/auth', component: () => import('./views/Auth.vue') },
  { path: '/profile', component: () => import('./views/Profile.vue') },
  { path: '/:catchAll(.*)', component: () => import('./views/404.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
