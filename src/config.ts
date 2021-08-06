import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'
import { initializeApp } from 'firebase/app'
import { getAnalytics, setAnalyticsCollectionEnabled } from 'firebase/analytics'
import useCookieConsent from './hooks/useCookieConsent'
import { watch } from 'vue'

import type { Vue } from '@sentry/vue/dist/types'
import type { Router } from 'vue-router'

const firebaseConfig = {
  apiKey: "AIzaSyD07mROu__kGOuJ-0MyjtjS6R5-DiTfUpM",
  authDomain: "the-tricktionary.com",
  projectId: "project-5641153190345267944",
  messagingSenderId: "1048157266079",
  appId: "1:1048157266079:web:a8ae83f6f16d7436",
  measurementId: "G-G282NYD80K"
}

const { granted } = useCookieConsent()

initializeApp(firebaseConfig)
// configure analytics
const analytics = getAnalytics()
watch(granted, granted => {
  setAnalyticsCollectionEnabled(analytics, granted ?? false)
}, { immediate: true })

export function initSentry ({ app, router }: { app: Vue, router: Router }) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      release: `tricktionary-web-v4@${import.meta.env.VITE_COMMIT_REF?.toString()}`,
      environment: import.meta.env.VITE_CONTEXT?.toString(),
      logErrors: true,
      integrations: [new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracingOrigins: ['api.the-tricktionary.com']
      })],
      tracesSampleRate: 1.0
    })
  }
}
