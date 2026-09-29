import { computed, ref } from 'vue'

import { adsEnabled } from '../ads'

/** How long Google's consent message has to say whether it asks this visitor before ours does */
const GOOGLE_TIMEOUT = 3000

function readCookie () {
  if (document.cookie.includes('cookie-consent=allow')) return true
  if (document.cookie.includes('cookie-consent=deny')) return false
  return null
}

/** The answer to our own banner */
const own = ref<boolean | null>(readCookie())

/** Whether the GDPR applies to this visitor, as Google's consent message sees it */
const gdprApplies = ref<boolean | null>(null)
/** The answer to Google's consent message about analytics, 'unasked' when it doesn't ask about analytics */
const googleAnalytics = ref<'granted' | 'denied' | 'unasked' | null>(null)
/** Google's consent message hasn't said, e.g. behind an ad blocker */
const googleSilent = ref(!adsEnabled)

/**
 * Google's consent message asks visitors in the EEA, the UK and Switzerland,
 * for ads and, with consent mode for analytics turned on in AdSense, for
 * analytics too. Our banner asks everyone else, and everyone Google's message
 * doesn't ask about analytics. null until Google's message says.
 */
const googleAsks = computed(() => {
  if (googleAnalytics.value === 'unasked') return false
  if (googleAnalytics.value !== null) return true
  if (gdprApplies.value !== null) return gdprApplies.value
  return googleSilent.value ? false : null
})

// While Google's message loads, an earlier answer to ours stands
const granted = computed(() => {
  if (!googleAsks.value) return own.value
  if (googleAnalytics.value === 'granted') return true
  if (googleAnalytics.value === 'denied') return false
  return null
})

const showBanner = computed(() => googleAsks.value === false && own.value === null)

function readGoogleAnalytics () {
  const googlefc = window.googlefc
  const status = googlefc?.getGoogleConsentModeValues?.().analyticsStoragePurposeConsentStatus
  const statuses = googlefc?.ConsentModePurposeStatusEnum
  if (status == null || statuses == null) return
  if (status === statuses.GRANTED) googleAnalytics.value = 'granted'
  else if (status === statuses.DENIED) googleAnalytics.value = 'denied'
  else if (status === statuses.NOT_APPLICABLE || status === statuses.NOT_CONFIGURED) googleAnalytics.value = 'unasked'
}

/** Hooks into Google's consent message, which AdSense's tag loads */
export function listenToGoogleConsent (adsense: Promise<void>) {
  window.googlefc ??= {}
  window.googlefc.callbackQueue ??= []
  window.googlefc.callbackQueue.push({
    CONSENT_API_READY () {
      window.__tcfapi?.('addEventListener', 2, (tcData, success) => {
        if (!success) return
        if (typeof tcData.gdprApplies === 'boolean') gdprApplies.value = tcData.gdprApplies
        if (tcData.eventStatus === 'tcloaded' || tcData.eventStatus === 'useractioncomplete') readGoogleAnalytics()
      })
    },
    CONSENT_DATA_READY: readGoogleAnalytics
  })
  adsense.catch(() => { googleSilent.value = true })
  setTimeout(() => { googleSilent.value = true }, GOOGLE_TIMEOUT)
}

export default function useCookieConsent () {
  return {
    /** Whether the visitor allows analytics, null until they have said */
    granted,
    showBanner,
    grant () {
      document.cookie = `cookie-consent=allow; max-age=${60 * 60 * 24 * 356 * 3}; path=/`
      own.value = true
    },
    deny () {
      document.cookie = `cookie-consent=deny; max-age=${60 * 60 * 24}; path=/`
      own.value = false
    }
  }
}
