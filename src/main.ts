import 'virtual:windi.css'
import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import { registerSW } from 'virtual:pwa-register'
import router from './routes'
import App from './App.vue'
import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

registerSW({})

createApp(App)
.use(createHead())
.use(router)
.mount('#app')

initializeApp({
  apiKey: "AIzaSyD07mROu__kGOuJ-0MyjtjS6R5-DiTfUpM",
  authDomain: "project-5641153190345267944.firebaseapp.com",
  projectId: "project-5641153190345267944",
  messagingSenderId: "1048157266079",
  appId: "1:1048157266079:web:a8ae83f6f16d7436",
  measurementId: "G-G282NYD80K"
})
getAnalytics()

Sentry.init({
  dsn: 'https://f1e35252e18a4e8195ccac61777fe9c7@o142353.ingest.sentry.io/5824230',
  release: `tricktionary-web-v4@${import.meta.env.VITE_COMMIT_REF?.toString()}`,
  environment: import.meta.env.VITE_CONTEXT?.toString(),
  integrations: [new Integrations.BrowserTracing({
    tracingOrigins: ['the-tricktionary.com']
  })],
  tracesSampleRate: 1.0
})
