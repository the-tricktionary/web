import './config'
import { createApp } from 'vue'
import { createHead } from '@vueuse/head'

import router from './routes'
import App from './App.vue'
import useSW from './hooks/useSW'
import 'virtual:windi.css'

useSW()

createApp(App)
.use(createHead())
.use(router)
.mount('#app')
