import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      // path: '/',
      path: '/tricks',
      name: 'home',
      component: Home
    },
    {
      path: '/shop',
      alias: ['/'],
      name: 'shop',
      // route level code-splitting
      // this generates a separate chunk (trick.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "shop" */ './views/Shop.vue')
    },
    {
      path: '/policies',
      name: 'policies',
      component: () => import(/* webpackChunkName: "policies" */ './views/Policies.vue')
    },
    {
      path: '/trick/:type/:slug',
      name: 'trick-details',
      component: () => import(/* webpackChunkName: "trick" */ './views/TrickDetails.vue')
    },
    {
      path: '/details/:id0/:id1',
      name: 'trick-details-old',
      component: () => import(/* webpackChunkName: "trick" */ './views/TrickDetails.vue'),
      props: {
        oldLink: true
      }
    }
  ]
})
