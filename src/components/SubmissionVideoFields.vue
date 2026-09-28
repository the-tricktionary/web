<template>
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
        :disabled="disabled"
        @change="pickFile($event)"
      >
      <label :for="fileId" class="file-picker">{{ t('submit.chooseVideo') }}</label>
      <span :class="{ 'text-muted': !picked }">{{ picked?.name ?? t('submit.noVideo') }}</span>
      <button v-if="picked" type="button" class="file-picker" :disabled="disabled" @click="clearFile(null)">
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
      :disabled="disabled"
    >
    <span :id="attributionNameHelpId" class="text-muted text-sm">{{ t('submit.attributionNameHelp') }}</span>
  </label>

  <icon-checkbox v-model:checked="acceptLicence" :disabled="disabled">
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
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import useAuth from '../hooks/useAuth'

import IconCheckbox from './IconCheckbox.vue'
import IconClose from '~icons/mdi/close'

/** Courtesy checks, what the API and the Mux webhook allow is what counts */
const MAX_VIDEO_MEGABYTES = 250
const MAX_VIDEO_SECONDS = 90

defineProps<{
  disabled?: boolean
}>()

/** Set once its length has been checked */
const file = defineModel<File | null>('file', { required: true })
const attributionName = defineModel<string>('attributionName', { required: true })
const acceptLicence = defineModel<boolean>('acceptLicence', { required: true })

const { t } = useI18n()
const { user } = useAuth()

const attributionNameHelpId = useId()
const fileId = useId()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

/** The chosen file, its length still to be checked */
const picked = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const fileError = ref<string | null>(null)

// the name on the account is only an offer, the credit is whatever stands here
watch(() => user.value?.name ?? '', accountName => {
  if (attributionName.value === '') attributionName.value = accountName
}, { immediate: true })

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

defineExpose({
  clear: () => { clearFile(null) }
})
</script>

<style scoped>
/* the video row's buttons, not the btn class itself: an empty required file input makes the form invalid and form:invalid greys those out */
.file-picker {
  @apply btn w-max;
}

/* the shortcut's block display would stack the icon over the label */
button.file-picker {
  @apply inline-flex items-center gap-1;
}

/* the sr-only input is what takes focus, so its label has to show the ring */
input:focus-visible + .file-picker {
  @apply outline-2 outline-solid outline-ttred-900 outline-offset-2;
}
</style>
