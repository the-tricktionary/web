interface ViteTypeOptions {
  // Make import.meta.env strictly typed: only the keys declared below exist
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_COMMIT_REF?: string
  readonly VITE_CONTEXT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
