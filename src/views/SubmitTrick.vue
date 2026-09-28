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

        <submission-video-fields
          ref="videoFields"
          v-model:file="file"
          v-model:attribution-name="attributionName"
          v-model:accept-licence="acceptLicence"
          :disabled="busy"
        />
      </form>
    </template>
  </div>

  <bottom-bar v-if="error || uploadError">
    <submission-error :error="error" :upload-error="uploadError" />
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
import { computed, ref, useId, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { getAnalytics, logEvent } from '@firebase/analytics'

import { Discipline, useCreateTrickSubmissionMutation } from '../graphql/generated/graphql'
import { enumKey, languageName } from '../helpers'
import useLanguage from '../hooks/useLanguage'
import useSubmissionUpload from '../hooks/useSubmissionUpload'

import BottomBar from '../components/BottomBar.vue'
import SubmissionError from '../components/SubmissionError.vue'
import SubmissionVideoFields from '../components/SubmissionVideoFields.vue'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconLoading from '~icons/mdi/loading'
import IconUpload from '~icons/mdi/upload'

const { t } = useI18n()
const route = useRoute()
const analytics = getAnalytics()
const { languages, lang } = useLanguage()

/** Lets the submit button live in the bottom bar, outside the form element */
const formId = useId()
const alternativeNamesHelpId = useId()
const progressId = useId()
const videoFields = useTemplateRef('videoFields')

useHead({ title: computed(() => t('submit.title')) })

const disciplines = Object.values(Discipline)

const discipline = ref<Discipline | ''>(disciplines.find(option => option === route.query.discipline) ?? '')
const textLang = ref(lang.value)
const name = ref('')
const alternativeNames = ref('')
const description = ref('')
const attributionName = ref('')
const acceptLicence = ref(false)
const file = ref<File | null>(null)

const submitted = ref(false)

const { mutate } = useCreateTrickSubmissionMutation({})

const { registered, uploading, progress, error, uploadError, busy, submit } = useSubmissionUpload({
  failedKey: 'submit.failed',
  async register () {
    const result = await mutate({
      data: {
        discipline: discipline.value as Discipline,
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
    return { submission, url }
  }
})

const valid = computed(() =>
  discipline.value !== '' &&
  name.value.trim().length > 0 &&
  file.value != null &&
  attributionName.value.trim().length > 0 &&
  acceptLicence.value
)

const alternativeNamesList = computed(() => alternativeNames.value
  .split(/[\n,]/)
  .map(alternativeName => alternativeName.trim())
  .filter(alternativeName => alternativeName.length > 0)
)

async function save () {
  const video = file.value
  if (!valid.value || !video) return

  const submission = await submit(video)
  if (!submission) return
  submitted.value = true
  videoFields.value?.clear()

  logEvent(analytics, 'submit_trick', {
    trick_name: submission.name,
    discipline: submission.discipline
  })
}
</script>

<style scoped>
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
