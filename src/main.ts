import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'
import gtagjs from 'vue-gtagjs'
import VS2 from 'vue-script2'
// import VueFuse from "vue-fuse";
import Ads from 'vue-google-adsense'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faCheckDouble, faMinus, faPlus, faSpinner, faBars, faEnvelopeSquare, faShoppingCart, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faPaypal, faFacebookSquare, faTwitterSquare, faInstagram, faGooglePlay, faApple, faGoogle, faFacebookF, faTwitter, faGithub, faMicrosoft, faYahoo } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faCheck)
library.add(faCheckDouble)
library.add(faMinus)
library.add(faPlus)
library.add(faTimes)
library.add(faSpinner)
library.add(faBars)
library.add(faPaypal)
library.add(faFacebookSquare)
library.add(faFacebookF)
library.add(faTwitterSquare)
library.add(faInstagram)
library.add(faGooglePlay)
library.add(faApple)
library.add(faGoogle)
library.add(faTwitter)
library.add(faGithub)
library.add(faMicrosoft)
library.add(faYahoo)
library.add(faEnvelopeSquare)
library.add(faShoppingCart)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Sentry.init({
  dsn: 'https://c13aebf54b42470ebf6ec34aa8c3acbe@sentry.io/1340462',
  integrations: [new Integrations.Vue({ Vue, attachProps: true, logErrors: true })]
})

Vue.use(VS2)
Vue.use(Ads.Adsense)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

gtagjs(router, 'G-TBSNR92SC0', { debug: true, scriptId: 'gtagjs' })
