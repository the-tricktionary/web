<template>
  <label class="flex flex-col gap-1">
    <span class="font-semibold">{{ t('speed.create.customName') }}</span>
    <input
      v-model="name"
      type="text"
      required
      maxlength="120"
      :placeholder="t('speed.create.customNamePlaceholder')"
      class="rounded"
      :disabled="disabled"
    >
  </label>

  <label class="flex flex-col gap-1">
    <span class="font-semibold">{{ t('speed.create.duration') }}</span>
    <input
      v-model.number="totalDuration"
      type="number"
      required
      min="0"
      max="3600"
      step="1"
      class="rounded"
      :disabled="disabled"
    >
    <span class="text-muted text-sm">{{ t('speed.create.durationHint') }}</span>
  </label>

  <fieldset class="border-none p-0 m-0 flex flex-col gap-2" :disabled="disabled">
    <legend class="font-semibold p-0 mb-1">
      {{ t('speed.create.switches') }} <span class="text-muted font-normal">{{ t('speed.create.optional') }}</span>
    </legend>
    <p class="text-muted text-sm mb-0">
      {{ t('speed.create.switchesHint') }}
    </p>

    <div v-for="(cue, index) of cues" :key="cue.key" class="flex gap-2 items-start">
      <label class="flex flex-col gap-1 w-32">
        <span class="sr-only">{{ t('speed.create.switchAt', { n: index + 1 }) }}</span>
        <input
          v-model.number="cue.offset"
          type="number"
          required
          min="1"
          :max="totalDuration > 0 ? totalDuration - 1 : undefined"
          step="1"
          class="rounded"
          :placeholder="t('speed.create.switchSeconds')"
        >
      </label>
      <label class="flex flex-col gap-1 flex-1">
        <span class="sr-only">{{ t('speed.create.switchLabel', { n: index + 1 }) }}</span>
        <input
          v-model="cue.label"
          type="text"
          maxlength="40"
          class="rounded"
          :placeholder="t('speed.create.switchLabelPlaceholder', { n: index + 2 })"
        >
      </label>
      <button
        type="button"
        class="btn w-max mt-0 p-2"
        :aria-label="t('speed.create.removeSwitch', { n: index + 1 })"
        @click="cues.splice(index, 1)"
      >
        <icon-close aria-hidden="true" />
      </button>
    </div>

    <p v-if="error" class="text-ttred-900 text-sm mb-0" role="alert">
      {{ error }}
    </p>

    <button type="button" class="btn grid grid-cols-[2rem_auto] w-max mt-0" @click="addSwitch()">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-plus />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.create.addSwitch') }}</span>
    </button>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import IconPlus from '~icons/mdi/plus'
import IconClose from '~icons/mdi/close'

import type { SwitchRow } from '../helpers'

withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const name = defineModel<string>('name', { required: true })
const totalDuration = defineModel<number>('totalDuration', { required: true })
const cues = defineModel<SwitchRow[]>('cues', { required: true })
/** So the form holding these fields knows whether it can be submitted */
const valid = defineModel<boolean>('valid', { required: true })

const { t } = useI18n()

let nextKey = 0

function addSwitch () {
  const last = cues.value[cues.value.length - 1]?.offset
  const suggestion = typeof last === 'number' ? last * 2 : Math.round(totalDuration.value / 2)
  cues.value.push({
    key: nextKey++,
    offset: totalDuration.value > 0 && suggestion > 0 && suggestion < totalDuration.value ? suggestion : undefined,
    label: ''
  })
}

const offsets = computed(() => cues.value
  .map(cue => cue.offset)
  .filter((offset): offset is number => typeof offset === 'number')
)

/** Mirrors what the API accepts, so a bad switch is caught before saving */
const error = computed(() => {
  if (!cues.value.length) return null
  if (offsets.value.length !== cues.value.length) return t('speed.create.switchMissing')
  if (totalDuration.value <= 0) return t('speed.create.switchNeedsDuration')
  if (offsets.value.some(offset => !Number.isSafeInteger(offset) || offset < 1 || offset >= totalDuration.value)) {
    return t('speed.create.switchOutside', { duration: totalDuration.value })
  }
  if (new Set(offsets.value).size !== offsets.value.length) return t('speed.create.switchDuplicate')
  return null
})

watch([error, name, totalDuration], () => {
  valid.value = error.value == null &&
    name.value.trim().length > 0 &&
    Number.isSafeInteger(totalDuration.value) &&
    totalDuration.value >= 0
}, { immediate: true, deep: true })
</script>
