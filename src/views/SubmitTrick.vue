<template>
  <div class="container mx-auto px-2 py-4 mb-20 max-w-160">
    <h1 class="mb-2">
      {{ t('submit.title') }}
    </h1>

    <div v-if="submitted" role="status">
      <p>{{ t('submit.done') }}</p>
      <router-link :to="{ name: 'profile' }" class="btn w-max inline-block">
        {{ t('submit.seeSubmissions') }}
      </router-link>
    </div>

    <template v-else>
      <p>{{ t('submit.intro') }}</p>

      <form :id="formId" class="flex flex-col gap-4 mt-4" @submit.prevent="save()">
        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('submit.discipline') }}</span>
          <select v-model="discipline" required class="rounded" :disabled="busy">
            <option value="">{{ t('submit.pick') }}</option>
            <option v-for="option of disciplines" :key="option" :value="option">
              {{ t(enumKey('discipline', option)) }}
            </option>
          </select>
        </label>

        <label v-if="languages.length > 1" class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('submit.lang') }}</span>
          <select v-model="textLang" class="rounded" :disabled="busy">
            <option v-for="language of languages" :key="language.id" :value="language.id" :lang="language.id">
              {{ languageName(language.id) }}
            </option>
          </select>
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('submit.name') }}</span>
          <input
            v-model="name"
            type="text"
            required
            :placeholder="t('submit.namePlaceholder')"
            class="rounded"
            :disabled="busy"
          >
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('submit.alternativeNames') }} <span class="text-muted font-normal">{{ t('submit.optional') }}</span></span>
          <textarea
            v-model="alternativeNames"
            rows="2"
            class="rounded"
            :aria-describedby="alternativeNamesHelpId"
            :disabled="busy"
          />
          <span :id="alternativeNamesHelpId" class="text-muted text-sm">{{ t('submit.alternativeNamesHelp') }}</span>
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('submit.description') }} <span class="text-muted font-normal">{{ t('submit.optional') }}</span></span>
          <textarea
            v-model="description"
            rows="5"
            :placeholder="t('submit.descriptionPlaceholder')"
            class="rounded"
            :disabled="busy"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('submit.trickType') }} <span class="text-muted font-normal">{{ t('submit.optional') }}</span></span>
          <select v-model="trickType" class="rounded" :disabled="busy">
            <option value="">{{ t('submit.trickTypeUnknown') }}</option>
            <option v-for="option of trickTypes" :key="option" :value="option">
              {{ t(enumKey('trickType', option)) }}
            </option>
          </select>
        </label>

        <div class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('submit.video') }}</span>
          <div class="flex flex-wrap items-center gap-2">
            <input
              :id="fileId"
              ref="fileInput"
              type="file"
              accept="video/*"
              required
              class="sr-only"
              :disabled="busy"
              @change="pickFile($event)"
            >
            <label :for="fileId" class="file-picker">{{ t('submit.chooseVideo') }}</label>
            <span :class="{ 'text-muted': !picked }">{{ picked?.name ?? t('submit.noVideo') }}</span>
            <button v-if="picked" type="button" class="file-picker inline-flex items-center gap-1" :disabled="busy" @click="clearFile(null)">
              <icon-close aria-hidden="true" />
              {{ t('submit.removeVideo') }}
            </button>
          </div>
          <span class="text-muted text-sm">{{ t('submit.videoHelp', { seconds: MAX_VIDEO_SECONDS, megabytes: MAX_VIDEO_MEGABYTES }) }}</span>
          <video
            v-if="previewUrl"
            :src="previewUrl"
            controls
            preload="metadata"
            class="w-full max-w-80 rounded bg-placeholder"
            @loadedmetadata="checkDuration($event)"
            @error="acceptFile()"
          />
          <p v-if="fileError" role="alert" class="text-ttred-900 mb-0">
            {{ fileError }}
          </p>
        </div>

        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('submit.attributionName') }}</span>
          <input
            v-model="attributionName"
            type="text"
            required
            maxlength="100"
            class="rounded"
            :aria-describedby="attributionNameHelpId"
            :disabled="busy"
          >
          <span :id="attributionNameHelpId" class="text-muted text-sm">{{ t('submit.attributionNameHelp') }}</span>
        </label>

        <icon-checkbox v-model:checked="acceptLicence" :disabled="busy">
          <i18n-t keypath="submit.licence" tag="span">
            <template #licence>
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener"
                class="text-link hover:text-link-hover underline"
              >{{ t('submit.licenceName') }}</a>
            </template>
          </i18n-t>
        </icon-checkbox>
      </form>
    </template>
  </div>

  <bottom-bar v-if="error || uploadError">
    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>
    <p v-else class="text-ttred-900 mb-0" role="alert">
      {{ t('submit.videoMissing', { error: uploadError }) }}
      <router-link :to="{ name: 'profile' }">
        {{ t('submit.seeSubmissions') }}
      </router-link>
    </p>
  </bottom-bar>

  <!-- mounted with the bar below it, so the progress sits on the bar's top edge -->
  <Teleport to="#bottom-bars">
    <div v-if="uploading">
      <label :for="progressId" class="sr-only">{{ t('submit.uploading') }}</label>
      <progress :id="progressId" :value="progress" max="100" class="upload-progress" />
    </div>
  </Teleport>

  <bottom-bar>
    <router-link to="/" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('trick.allTricks') }}</span>
    </router-link>

    <button
      v-if="!submitted"
      type="submit"
      :form="formId"
      class="btn grid grid-cols-[2rem_auto] w-max mt-0 ml-auto"
      :disabled="busy || !valid"
    >
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-loading v-if="busy" class="animate-spin" />
        <icon-upload v-else />
      </span>
      <span class="flex px-2 items-center">{{ registered ? t('submit.retry') : t('submit.save') }}</span>
    </button>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { getAnalytics, logEvent } from '@firebase/analytics'

import { Discipline, TrickType, useCreateTrickSubmissionMutation } from '../graphql/generated/graphql'
import { enumKey, languageName } from '../helpers'
import useAuth from '../hooks/useAuth'
import useLanguage from '../hooks/useLanguage'

import BottomBar from '../components/BottomBar.vue'
import IconCheckbox from '../components/IconCheckbox.vue'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconClose from '~icons/mdi/close'
import IconLoading from '~icons/mdi/loading'
import IconUpload from '~icons/mdi/upload'

import type { CreateTrickSubmissionMutation } from '../graphql/generated/graphql'

/** Courtesy checks, what the API and the Mux webhook allow is what counts */
const MAX_VIDEO_MEGABYTES = 250
const MAX_VIDEO_SECONDS = 90

const { t } = useI18n()
const route = useRoute()
const analytics = getAnalytics()
const { user } = useAuth()
const { languages, lang } = useLanguage()

/** Lets the submit button live in the bottom bar, outside the form element */
const formId = useId()
const alternativeNamesHelpId = useId()
const attributionNameHelpId = useId()
const fileId = useId()
const progressId = useId()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

useHead({ title: computed(() => t('submit.title')) })

const disciplines = Object.values(Discipline)
const trickTypes = computed(() => [...Object.values(TrickType)]
  .sort((a, b) => t(enumKey('trickType', a)).localeCompare(t(enumKey('trickType', b)), lang.value))
)

const discipline = ref<Discipline | ''>(disciplines.find(option => option === route.query.discipline) ?? '')
const textLang = ref(lang.value)
const name = ref('')
const alternativeNames = ref('')
const description = ref('')
const trickType = ref<TrickType | ''>('')
const attributionName = ref('')
const acceptLicence = ref(false)
/** The chosen file, its length still to be checked */
const picked = ref<File | null>(null)
const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const uploading = ref(false)
const progress = ref(0)
const submitted = ref(false)
const error = ref<string | null>(null)
const uploadError = ref<string | null>(null)
const fileError = ref<string | null>(null)
/** The submission the API has taken, and the URL its video goes to */
const registered = ref<{ submission: CreateTrickSubmissionMutation['createTrickSubmission'], url: string } | null>(null)

const { mutate, loading: saving } = useCreateTrickSubmissionMutation({})

const busy = computed(() => saving.value || uploading.value)

const valid = computed(() =>
  discipline.value !== '' &&
  name.value.trim().length > 0 &&
  file.value != null &&
  attributionName.value.trim().length > 0 &&
  acceptLicence.value
)

// the name on the account is only an offer, the credit is whatever stands here
watch(() => user.value?.name ?? '', accountName => {
  if (attributionName.value === '') attributionName.value = accountName
}, { immediate: true })

const alternativeNamesList = computed(() => alternativeNames.value
  .split(/[\n,]/)
  .map(alternativeName => alternativeName.trim())
  .filter(alternativeName => alternativeName.length > 0)
)

/** Forgets the previous file, the input keeps whatever was just picked */
function resetFile () {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  picked.value = null
  file.value = null
  fileError.value = null
}

/** Drops the chosen file, so the required input asks for another one */
function clearFile (message: string | null) {
  resetFile()
  if (fileInput.value) fileInput.value.value = ''
  fileError.value = message
}

function pickFile (event: Event) {
  const chosen = (event.target as HTMLInputElement).files?.[0] ?? null
  resetFile()
  if (!chosen) return
  if (chosen.size > MAX_VIDEO_MEGABYTES * 1024 * 1024) {
    clearFile(t('submit.videoTooBig', { megabytes: MAX_VIDEO_MEGABYTES }))
    return
  }
  picked.value = chosen
  previewUrl.value = URL.createObjectURL(chosen)
}

/** A file the browser has nothing to say about is Mux's to judge */
function acceptFile () {
  file.value = picked.value
}

function checkDuration (event: Event) {
  const { duration } = event.target as HTMLVideoElement
  if (Number.isFinite(duration) && duration > MAX_VIDEO_SECONDS) clearFile(t('submit.videoTooLong', { seconds: MAX_VIDEO_SECONDS }))
  else acceptFile()
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

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

async function save () {
  const video = file.value
  if (!valid.value || busy.value || !video) return
  error.value = null
  uploadError.value = null
  progress.value = 0

  // a submission the API has already taken counts against the limits, so the
  // video goes to the URL it handed out rather than to a second submission
  if (!registered.value) {
    const started = await register()
    if (!started) return
  }
  await sendVideo(video)
}

/** Registers the submission, false when the API refused it */
async function register () {
  if (!discipline.value) return false
  try {
    const result = await mutate({
      data: {
        discipline: discipline.value,
        ...(trickType.value ? { trickType: trickType.value } : {}),
        lang: textLang.value,
        name: name.value.trim(),
        ...(alternativeNamesList.value.length ? { alternativeNames: alternativeNamesList.value } : {}),
        ...(description.value.trim() ? { description: description.value.trim() } : {}),
        attributionName: attributionName.value.trim(),
        acceptLicence: acceptLicence.value
      }
    })
    const submission = result?.data?.createTrickSubmission
    const url = submission?.upload.url
    if (!submission || url == null) throw new Error(t('submit.noUpload'))
    registered.value = { submission, url }
    return true
  } catch (err) {
    error.value = errorMessage(err)
    return false
  }
}

async function sendVideo (video: File) {
  const held = registered.value
  if (!held) return
  uploading.value = true
  try {
    await put(held.url, video)
    submitted.value = true
    clearFile(null)

    logEvent(analytics, 'submit_trick', {
      trick_name: held.submission.name,
      discipline: held.submission.discipline
    })
  } catch (err) {
    uploadError.value = message(err)
  } finally {
    uploading.value = false
  }
}

/** The message of a reached limit, and of anything else what the API said */
function errorMessage (err: unknown) {
  const graphQLErrors = (err as { graphQLErrors?: Array<{ extensions?: Record<string, unknown> }> } | null | undefined)?.graphQLErrors ?? []
  const limited = graphQLErrors.find(graphQLError => graphQLError.extensions?.code === 'RATE_LIMITED')?.extensions
  if (!limited) return t('submit.failed', { error: message(err) })
  return limited.scope === 'global'
    ? t('submit.rateLimitedGlobal')
    : t('submit.rateLimitedUser', { limit: limited.limit })
}

function message (err: unknown) {
  return err instanceof Error ? err.message : t('submit.unknownError')
}
</script>

<style scoped>
/* the video row's buttons, not the btn class itself: an empty required file input makes the form invalid and form:invalid greys those out */
.file-picker {
  @apply btn w-max;
}

/* the sr-only input is what takes focus, so its label has to show the ring */
input:focus-visible + .file-picker {
  @apply outline-2 outline-solid outline-ttred-900 outline-offset-2;
}

/* a flat strip on the bar's top edge, drawn by hand as the native bar has rounded ends */
.upload-progress {
  appearance: none;
  display: block;
  width: 100%;
  height: 0.25rem;
  border: none;
  border-radius: 0;
  background-color: var(--tt-sunken);
}

.upload-progress::-webkit-progress-bar {
  background-color: var(--tt-sunken);
}

.upload-progress::-webkit-progress-value {
  background-color: theme('colors.ttred.500');
  transition: width 0.2s ease-out;
}

.upload-progress::-moz-progress-bar {
  background-color: theme('colors.ttred.500');
}
</style>
