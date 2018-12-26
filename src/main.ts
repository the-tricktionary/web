import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import * as Sentry from '@sentry/browser'
import VueAnalytics from 'vue-analytics'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faMinus, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCheck)
library.add(faMinus)
library.add(faPlus)
library.add(faSpinner)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Sentry.init({ dsn: 'https://c13aebf54b42470ebf6ec34aa8c3acbe@sentry.io/1340462' })

Vue.use(VueAnalytics, {
  id: 'UA-79206862-1'
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
