import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

/** The submission the API has taken, and the URL its video goes to */
export interface RegisteredSubmission<T> {
  submission: T
  url: string
}

interface Options<T> {
  /** Registers the submission with the API, which answers with the upload URL */
  register: () => Promise<RegisteredSubmission<T>>
  /** Message key for a submission the API refused, given the `error` */
  failedKey: string
}

/**
 * Registers a submission and sends its video to the URL the API hands out.
 * Either kind of submission the API has taken counts against the limits, so a
 * video that did not arrive goes to that same URL again rather than to a second
 * submission.
 */
export default function useSubmissionUpload<T> ({ register, failedKey }: Options<T>) {
  const { t } = useI18n()

  const registering = ref(false)
  const uploading = ref(false)
  const progress = ref(0)
  const registered = shallowRef<RegisteredSubmission<T> | null>(null)
  /** The API refused the submission */
  const error = ref<string | null>(null)
  /** The submission is registered, but its video did not arrive */
  const uploadError = ref<string | null>(null)

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
      return held.submission
    } catch (err) {
      uploadError.value = message(err)
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
