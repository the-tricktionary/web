<template>
  <dialog
    ref="dialog"
    :aria-labelledby="titleId"
    class="bg-surface text-content rounded border border-solid border-line p-0 m-auto w-[calc(100%-2rem)] max-w-160 max-h-[calc(100dvh-2rem)]"
    @close="emit('close')"
    @cancel="event => { if (busy) event.preventDefault() }"
  >
    <div class="p-4 flex flex-col gap-4">
      <h2 :id="titleId" class="mb-0">
        {{ t('submitVideo.title', { name: trickName }) }}
      </h2>

      <div v-if="submitted" role="status">
        <p>{{ t('submitVideo.done') }}</p>
        <router-link :to="{ name: 'profile' }" class="btn w-max inline-block">
          {{ t('submit.seeSubmissions') }}
        </router-link>
      </div>

      <template v-else>
        <p class="mb-0">
          {{ t('submitVideo.intro') }}
        </p>

        <form :id="formId" class="flex flex-col gap-4" @submit.prevent="save()">
          <submission-video-fields
            ref="videoFields"
            v-model:file="file"
            v-model:attribution-name="attributionName"
            v-model:accept-licence="acceptLicence"
            :disabled="busy"
          />
        </form>
      </template>

      <div v-if="uploading">
        <label :for="progressId" class="sr-only">{{ t('submit.uploading') }}</label>
        <progress :id="progressId" :value="progress" max="100" class="block w-full accent-ttred-500" />
      </div>

      <submission-error :error="error" :upload-error="uploadError" />

      <!-- outside the form, which greys out its buttons while it is invalid -->
      <div class="flex flex-wrap justify-end gap-2">
        <button type="button" class="btn w-max" :disabled="busy" @click="dialog?.close()">
          {{ submitted ? t('submitVideo.close') : t('submitVideo.cancel') }}
        </button>
        <button
          v-if="!submitted"
          type="submit"
          :form="formId"
          class="btn w-max inline-flex items-center gap-2"
          :disabled="busy || !valid"
        >
          <icon-loading v-if="busy" class="animate-spin" aria-hidden="true" />
          <icon-upload v-else aria-hidden="true" />
          {{ registered ? t('submit.retry') : t('submitVideo.save') }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useId, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAnalytics, logEvent } from '@firebase/analytics'

import { useCreateTrickVideoSubmissionMutation } from '../graphql/generated/graphql'
import useSubmissionUpload from '../hooks/useSubmissionUpload'

import SubmissionError from './SubmissionError.vue'
import SubmissionVideoFields from './SubmissionVideoFields.vue'
import IconLoading from '~icons/mdi/loading'
import IconUpload from '~icons/mdi/upload'

const { trickId, trickName } = defineProps<{
  trickId: string
  trickName: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const analytics = getAnalytics()

const dialog = useTemplateRef('dialog')
const videoFields = useTemplateRef('videoFields')
const titleId = useId()
const formId = useId()
const progressId = useId()

const file = ref<File | null>(null)
const attributionName = ref('')
const acceptLicence = ref(false)
const submitted = ref(false)

const { mutate } = useCreateTrickVideoSubmissionMutation({})

const { registered, uploading, progress, error, uploadError, busy, submit } = useSubmissionUpload({
  failedKey: 'submitVideo.failed',
  resumeKey: trickId,
  async register () {
    const result = await mutate({
      trickId,
      data: {
        attributionName: attributionName.value.trim(),
        acceptLicence: acceptLicence.value
      }
    })
    const submission = result?.data?.createTrickVideoSubmission
    const url = submission?.upload.url
    if (!submission || url == null) throw new Error(t('submit.noUpload'))
    return { submission, url }
  }
})

const valid = computed(() =>
  file.value != null &&
  attributionName.value.trim().length > 0 &&
  acceptLicence.value
)

async function save () {
  const video = file.value
  if (!valid.value || !video) return

  const submission = await submit(video)
  if (!submission) return
  submitted.value = true
  videoFields.value?.clear()

  logEvent(analytics, 'submit_video', { trick_id: trickId })
}

onMounted(() => {
  dialog.value?.showModal()
})
</script>

<style scoped>
dialog::backdrop {
  background-color: rgb(0 0 0 / 0.5);
}
</style>
