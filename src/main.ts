import { initSentry } from './config'
import { createApp } from 'vue'
import { createHead } from '@vueuse/head'

import router from './routes'
import App from './App.vue'
import useSW from './hooks/useSW'
import 'virtual:windi.css'
import 'unfonts.css'

useSW()

export const app = createApp(App)

initSentry({ app, router })

app.use(createHead())
  .use(router)
  .mount('#app')
