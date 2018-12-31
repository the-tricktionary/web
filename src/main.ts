import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import * as Sentry from '@sentry/browser'
import VueAnalytics from 'vue-analytics'
import VS2 from 'vue-script2'
import Ads from 'vue-google-adsense'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faMinus, faPlus, faSpinner, faBars, faEnvelopeSquare, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { faPaypal, faFacebookSquare, faTwitterSquare, faInstagram, faGooglePlay, faApple } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCheck)
library.add(faMinus)
library.add(faPlus)
library.add(faSpinner)
library.add(faBars)
library.add(faPaypal)
library.add(faFacebookSquare)
library.add(faTwitterSquare)
library.add(faInstagram)
library.add(faGooglePlay)
library.add(faApple)
library.add(faEnvelopeSquare)
library.add(faShoppingCart)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Sentry.init({ dsn: 'https://c13aebf54b42470ebf6ec34aa8c3acbe@sentry.io/1340462' })

Vue.use(VueAnalytics, {
  id: 'UA-79206862-1'
})

Vue.use(VS2)
Vue.use(Ads.Adsense)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
