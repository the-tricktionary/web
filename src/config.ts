import * as Sentry from '@sentry/vue'
import { initializeApp } from 'firebase/app'
import { getAnalytics, setAnalyticsCollectionEnabled, setConsent } from 'firebase/analytics'
import useCookieConsent, { listenToGoogleConsent } from './hooks/useCookieConsent'
import { adsEnabled, loadAdsense } from './ads'
import { watch } from 'vue'

import type { FirebaseOptions } from 'firebase/app'
import type { Router } from 'vue-router'

if (!import.meta.env.VITE_FIREBASE_CONFIG) throw new Error('VITE_FIREBASE_CONFIG is not set, see the README')
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG) as FirebaseOptions

// Denied until the visitor says otherwise, before anything reaches gtag.js.
// It only reads commands pushed as an arguments object, and Firebase sends
// the default it's given only once it has fetched its config, after our
// first update below.
window.dataLayer ??= []
function gtag (..._args: unknown[]) {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer!.push(arguments)
}
gtag('consent', 'default', {
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  ad_storage: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
})

if (adsEnabled) listenToGoogleConsent(loadAdsense())

const consent = useCookieConsent()

initializeApp(firebaseConfig)
// configure analytics
const analytics = getAnalytics()
// Our banner asks about analytics only. Where Google's consent message asks
// about ads, it sets the ad consent itself.
watch(consent.granted, granted => {
  setAnalyticsCollectionEnabled(analytics, granted ?? false)
  setConsent({ analytics_storage: granted ? 'granted' : 'denied' })
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
