interface ViteTypeOptions {
  // Make import.meta.env strictly typed: only the keys declared below exist
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string
  /** The FIREBASE_CONFIG variable of this repository's Actions */
  readonly VITE_FIREBASE_CONFIG: string
  /** Without one the API treats the app as anonymous */
  readonly VITE_API_KEY?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_COMMIT_REF?: string
  readonly VITE_CONTEXT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Google's consent message, the parts of its API the app uses */
interface GoogleFc {
  callbackQueue?: Array<Partial<Record<'CONSENT_API_READY' | 'CONSENT_DATA_READY', () => void>>>
  ConsentModePurposeStatusEnum?: Record<'UNKNOWN' | 'GRANTED' | 'DENIED' | 'NOT_APPLICABLE' | 'NOT_CONFIGURED', number>
  getGoogleConsentModeValues?: () => { analyticsStoragePurposeConsentStatus?: number }
}

/** The IAB TCF v2 CMP API, which Google's consent message implements */
type TcfApi = (
  command: 'addEventListener',
  version: 2,
  callback: (tcData: { gdprApplies?: boolean, eventStatus?: string }, success: boolean) => void
) => void

interface Window {
  adsbygoogle?: object[]
  dataLayer?: unknown[]
  googlefc?: GoogleFc
  __tcfapi?: TcfApi
}
