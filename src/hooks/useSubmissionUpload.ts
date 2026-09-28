import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

/** The submission the API has taken, and the URL its video goes to */
export interface RegisteredSubmission<T> {
  submission: T
  url: string
}

interface Options<T> {
  register: () => Promise<RegisteredSubmission<T>>
  /** Message key for a submission the API refused, given the `error` */
  failedKey: string
  /** Where a form that closes before the video arrives picks the submission up when it opens again */
  resumeKey?: string
}

/** Registered submissions whose video has not arrived, by `resumeKey` */
const unsent = new Map<string, { held: RegisteredSubmission<unknown>, uploadError: string | null }>()

/**
 * Registers a submission and sends its video. A registered submission counts
 * against the limits, so a retry sends the video to the same URL rather than
 * registering another.
 */
export default function useSubmissionUpload<T> ({ register, failedKey, resumeKey }: Options<T>) {
  const { t } = useI18n()
  const resumed = resumeKey != null ? unsent.get(resumeKey) : undefined

  const registering = ref(false)
  const uploading = ref(false)
  const progress = ref(0)
  const registered = shallowRef((resumed?.held as RegisteredSubmission<T> | undefined) ?? null)
  /** The API refused the submission */
  const error = ref<string | null>(null)
  /** The submission is registered, but its video did not arrive */
  const uploadError = ref(resumed?.uploadError ?? null)

  function remember (held: RegisteredSubmission<T> | null) {
    if (resumeKey == null) return
    if (held) unsent.set(resumeKey, { held, uploadError: uploadError.value })
    else unsent.delete(resumeKey)
  }

  const busy = computed(() => registering.value || uploading.value)

  function message (err: unknown) {
    return err instanceof Error ? err.message : t('submit.unknownError')
  }

  /** The message of a reached limit, and of anything else what the API said */
  function errorMessage (err: unknown) {
    const graphQLErrors = (err as { graphQLErrors?: Array<{ extensions?: Record<string, unknown> }> } | null | undefined)?.graphQLErrors ?? []
    const limited = graphQLErrors.find(graphQLError => graphQLError.extensions?.code === 'RATE_LIMITED')?.extensions
    if (!limited) return t(failedKey, { error: message(err) })
    return limited.scope === 'global'
      ? t('submit.rateLimitedGlobal')
      : t('submit.rateLimitedUser', { limit: limited.limit })
  }

  /** Mux hands out a URL that takes the file as the body of a single PUT */
  async function put (url: string, video: File) {
    await new Promise<void>((resolve, reject) => {
      // XMLHttpRequest rather than fetch, which has no upload progress events
      const request = new XMLHttpRequest()
      request.open('PUT', url)
      request.setRequestHeader('Content-Type', video.type)
      request.upload.addEventListener('progress', event => {
        if (event.lengthComputable) progress.value = Math.round(event.loaded / event.total * 100)
      })
      request.addEventListener('load', () => {
        if (request.status >= 200 && request.status < 300) resolve()
        else reject(new Error(t('submit.uploadRefused', { status: request.status })))
      })
      request.addEventListener('error', () => { reject(new Error(t('submit.uploadFailed'))) })
      request.addEventListener('abort', () => { reject(new Error(t('submit.uploadCancelled'))) })
      request.send(video)
    })
  }

  /** Registers the submission unless the API already took it, false when it refused */
  async function ensureRegistered () {
    if (registered.value) return true
    registering.value = true
    try {
      registered.value = await register()
      remember(registered.value)
      return true
    } catch (err) {
      error.value = errorMessage(err)
      return false
    } finally {
      registering.value = false
    }
  }

  /** The submission once its video has arrived, null when either step failed */
  async function submit (video: File) {
    if (busy.value) return null
    error.value = null
    uploadError.value = null
    progress.value = 0

    if (!await ensureRegistered()) return null
    const held = registered.value
    if (!held) return null

    uploading.value = true
    try {
      await put(held.url, video)
      remember(null)
      return held.submission
    } catch (err) {
      uploadError.value = message(err)
      remember(held)
      return null
    } finally {
      uploading.value = false
    }
  }

  return {
    registered,
    uploading,
    progress,
    error,
    uploadError,
    busy,
    submit
  }
}
