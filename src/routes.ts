import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/:catchAll(.*)', component: () => import('./views/404.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
