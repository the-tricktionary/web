import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as Sentry from '@sentry/browser'
// import VueAnalytics from 'vue-analytics'

Sentry.init({ dsn: 'https://c13aebf54b42470ebf6ec34aa8c3acbe@sentry.io/1340462' })

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// Vue.use(VueAnalytics, {
//   id: 'UA-79206862-1'
// })
