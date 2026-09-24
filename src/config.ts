import * as Sentry from '@sentry/vue'
import { initializeApp } from 'firebase/app'
import { getAnalytics, setAnalyticsCollectionEnabled, setConsent } from 'firebase/analytics'
import useCookieConsent from './hooks/useCookieConsent'
import { watch } from 'vue'

import type { FirebaseOptions } from 'firebase/app'
import type { Router } from 'vue-router'

if (!import.meta.env.VITE_FIREBASE_CONFIG) throw new Error('VITE_FIREBASE_CONFIG is not set, see the README')
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG) as FirebaseOptions

const consent = useCookieConsent()

initializeApp(firebaseConfig)
// configure analytics
const analytics = getAnalytics()
;(window as any).dataLayer ??= []
;(window as any).dataLayer.push('consent', 'default', {
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  ad_storage: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
})
watch(consent.granted, granted => {
  setAnalyticsCollectionEnabled(analytics, granted ?? false)
  setConsent({
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
  })
}, { immediate: true })

export function initSentry ({ app, router }: { app: NonNullable<Parameters<typeof Sentry.init>[0]>['app'], router: Router }) {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      release: `tricktionary-web-v4@${import.meta.env.VITE_COMMIT_REF?.toString()}`,
      environment: import.meta.env.VITE_CONTEXT?.toString(),
      integrations: [Sentry.browserTracingIntegration({
        router,
      })],
      tracePropagationTargets: ['api.the-tricktionary.com', 'the-tricktionary.com'],
      tracesSampleRate: 1.0
    })
  }
}
