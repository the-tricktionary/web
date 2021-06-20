import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

initializeApp({
  apiKey: "AIzaSyD07mROu__kGOuJ-0MyjtjS6R5-DiTfUpM",
  authDomain: "the-tricktionary.com",
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
