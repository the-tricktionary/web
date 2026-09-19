import { initSentry } from './config'
import { type Component, createApp } from 'vue'
import { createHead } from '@unhead/vue/client'

import router from './routes'
import App from './App.vue'
import useSW from './hooks/useSW'
import 'uno.css'
import 'unfonts.css'

useSW()

export const app = createApp(App as Component)

initSentry({ app, router })

app.use(createHead())
  .use(router)
  .mount('#app')
