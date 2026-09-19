import { initSentry } from './config'
import { type Component, createApp } from 'vue'
import { createHead } from '@unhead/vue/client'

import i18n from './i18n'
import router from './routes'
import App from './App.vue'
import useSW from './hooks/useSW'
import 'uno.css'
import 'unfonts.css'

useSW()

export const app = createApp(App as Component)

initSentry({ app, router })

app.use(createHead())
  .use(i18n)
  .use(router)
  .mount('#app')
