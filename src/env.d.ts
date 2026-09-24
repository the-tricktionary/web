interface ViteTypeOptions {
  // Make import.meta.env strictly typed: only the keys declared below exist
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string
  /** The app's publishable API key, without one the API treats it as anonymous */
  readonly VITE_API_KEY?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_COMMIT_REF?: string
  readonly VITE_CONTEXT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
