import * as Sentry from '@sentry/vue'
import { initializeApp } from 'firebase/app'
import { getAnalytics, setAnalyticsCollectionEnabled, setConsent } from 'firebase/analytics'
import useCookieConsent from './hooks/useCookieConsent'
import { watch } from 'vue'

import type { Router } from 'vue-router'

const firebaseConfig = {
  apiKey: "AIzaSyD07mROu__kGOuJ-0MyjtjS6R5-DiTfUpM",
  authDomain: "the-tricktionary.com",
  projectId: "project-5641153190345267944",
  messagingSenderId: "1048157266079",
  appId: "1:1048157266079:web:a8ae83f6f16d7436",
  measurementId: "G-G282NYD80K"
}

const consent = useCookieConsent()

initializeApp(firebaseConfig)
// configure analytics
const analytics = getAnalytics()
;(window as any).dataLayer ??= []
;(window as any).dataLayer.push('consent', 'default', {
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500,
})
watch(consent.granted, granted => {
  setAnalyticsCollectionEnabled(analytics, granted ?? false)
  setConsent({
    'ad_user_data': granted ? 'granted' : 'denied',
    'ad_personalization': granted ? 'granted' : 'denied',
    'ad_storage': granted ? 'granted' : 'denied',
    'analytics_storage': granted ? 'granted' : 'denied',
  })
}, { immediate: true })

export function initSentry ({ app, router }: { app: NonNullable<Parameters<typeof Sentry.init>[0]>['app'], router: Router }) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      release: `tricktionary-web-v4@${import.meta.env.VITE_COMMIT_REF?.toString()}`,
      environment: import.meta.env.VITE_CONTEXT?.toString(),
      logErrors: true,
      integrations: [Sentry.browserTracingIntegration({
        router,
      })],
      tracePropagationTargets: ['api.the-tricktionary.com', 'the-tricktionary.com'],
      tracesSampleRate: 1.0
    })
  }
}
