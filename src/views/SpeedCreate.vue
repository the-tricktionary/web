<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <h1 class="mb-4">
      {{ t('speed.create.title') }}
    </h1>

    <form :id="formId" class="flex flex-col gap-4 max-w-120" @submit.prevent="save()">
      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.create.event') }}</span>
        <event-picker v-model="eventDefinitionId" allow-custom required :disabled="saving" />
      </label>

      <template v-if="eventDefinitionId === CUSTOM_EVENT">
        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('speed.create.customName') }}</span>
          <input
            v-model="customName"
            type="text"
            required
            maxlength="120"
            :placeholder="t('speed.create.customNamePlaceholder')"
            class="rounded"
            :disabled="saving"
          >
        </label>
        <label class="flex flex-col gap-1">
          <span class="font-semibold">{{ t('speed.create.duration') }}</span>
          <input
            v-model.number="customDuration"
            type="number"
            required
            min="0"
            max="3600"
            step="1"
            class="rounded"
            :disabled="saving"
          >
          <span class="text-muted text-sm">{{ t('speed.create.durationHint') }}</span>
        </label>

        <fieldset class="border-none p-0 m-0 flex flex-col gap-2" :disabled="saving">
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
                :max="customDuration > 0 ? customDuration - 1 : undefined"
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

          <p v-if="switchError" class="text-ttred-900 text-sm mb-0" role="alert">
            {{ switchError }}
          </p>

          <button type="button" class="btn grid grid-cols-[2rem_auto] w-max mt-0" @click="addSwitch()">
            <span class="flex h-full items-center justify-center" aria-hidden="true">
              <icon-plus />
            </span>
            <span class="flex px-2 items-center">{{ t('speed.create.addSwitch') }}</span>
          </button>
        </fieldset>
      </template>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.create.name') }} <span class="text-muted font-normal">{{ t('speed.create.optional') }}</span></span>
        <input
          v-model="name"
          type="text"
          maxlength="120"
          :placeholder="t('speed.create.namePlaceholder')"
          class="rounded"
          :disabled="saving"
        >
      </label>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.create.score') }}</span>
        <input
          v-model.number="count"
          type="number"
          required
          min="0"
          max="1000000"
          step="1"
          inputmode="numeric"
          class="rounded text-2xl"
          :disabled="saving"
        >
      </label>
    </form>
  </div>

  <bottom-bar v-if="error">
    <p class="text-ttred-900 mb-0" role="alert">
      {{ t('speed.create.failed', { error }) }}
    </p>
  </bottom-bar>

  <bottom-bar>
    <router-link :to="{ name: 'speed' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.allScores') }}</span>
    </router-link>

    <button
      type="submit"
      :form="formId"
      class="btn grid grid-cols-[2rem_auto] w-max mt-0 ml-auto"
      :disabled="saving || !valid"
    >
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-loading v-if="saving" class="animate-spin" />
        <icon-content-save v-else />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.create.save') }}</span>
    </button>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { getAnalytics, logEvent } from '@firebase/analytics'

import { TimingCueType, useCreateSpeedResultMutation } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import { addSpeedResultToCache } from '../hooks/useSpeedResults'
import { CUSTOM_EVENT } from '../helpers'

import BottomBar from '../components/BottomBar.vue'
import EventPicker from '../components/EventPicker.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconContentSave from '~icons/mdi/content-save'
import IconPlus from '~icons/mdi/plus'
import IconClose from '~icons/mdi/close'

const { t } = useI18n()

/** Lets the submit button live in the bottom bar, outside the form element */
const formId = useId()

useHead({ title: computed(() => t('speed.create.title')) })

const router = useRouter()
const analytics = getAnalytics()
const { user } = useAuth()

const eventDefinitionId = ref<string>('')
const customName = ref('')
const customDuration = ref<number>(30)
const name = ref('')
const count = ref<number>()
const error = ref<string | null>(null)

/**
 * Switches of a custom relay, in seconds from the start of the event. A
 * custom event has no timing track to place cues in, so its clock simply
 * runs from zero to its duration and only the switches need placing.
 */
let nextKey = 0
const cues = ref<Array<{ key: number, offset: number | undefined, label: string }>>([])

function addSwitch () {
  const last = cues.value[cues.value.length - 1]?.offset
  const suggestion = typeof last === 'number' ? last * 2 : Math.round(customDuration.value / 2)
  cues.value.push({
    key: nextKey++,
    offset: customDuration.value > 0 && suggestion > 0 && suggestion < customDuration.value ? suggestion : undefined,
    label: ''
  })
}

const switchOffsets = computed(() => cues.value
  .map(cue => cue.offset)
  .filter((offset): offset is number => typeof offset === 'number')
)

const switchError = computed(() => {
  if (!cues.value.length) return null
  if (switchOffsets.value.length !== cues.value.length) return t('speed.create.switchMissing')
  if (customDuration.value <= 0) return t('speed.create.switchNeedsDuration')
  if (switchOffsets.value.some(offset => !Number.isSafeInteger(offset) || offset < 1 || offset >= customDuration.value)) {
    return t('speed.create.switchOutside', { duration: customDuration.value })
  }
  if (new Set(switchOffsets.value).size !== switchOffsets.value.length) return t('speed.create.switchDuplicate')
  return null
})

const valid = computed(() => {
  if (!Number.isSafeInteger(count.value) || count.value! < 0) return false
  if (!eventDefinitionId.value) return false
  if (eventDefinitionId.value === CUSTOM_EVENT) {
    if (switchError.value) return false
    return customName.value.trim().length > 0 && Number.isSafeInteger(customDuration.value) && customDuration.value >= 0
  }
  return true
})

const { mutate, loading: saving } = useCreateSpeedResultMutation(() => ({
  update (cache, { data }) {
    if (data?.createSpeedResult && user.value) {
      addSpeedResultToCache(cache, user.value.id, data.createSpeedResult)
    }
  }
}))

async function save () {
  if (!valid.value || saving.value) return
  error.value = null
  try {
    const result = await mutate({
      data: {
        count: count.value,
        ...(name.value.trim() ? { name: name.value.trim() } : {}),
        ...(eventDefinitionId.value === CUSTOM_EVENT
          ? {
              eventDefinition: {
                name: customName.value.trim(),
                totalDuration: customDuration.value,
                ...(cues.value.length
                  ? {
                      cues: [...cues.value]
                        .sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0))
                        .map(cue => ({
                          type: TimingCueType.Switch,
                          offset: (cue.offset ?? 0) * 1000,
                          ...(cue.label.trim() ? { label: cue.label.trim() } : {})
                        }))
                    }
                  : {})
              }
            }
          : { eventDefinitionId: eventDefinitionId.value })
      }
    })
    const created = result?.data?.createSpeedResult
    if (!created) throw new Error('No result returned')

    logEvent(analytics, 'post_score', {
      score: created.count,
      level_name: created.eventDefinition.name
    })
    await router.replace({ name: 'speed-details', params: { id: created.id } })
  } catch (err) {
    error.value = (err as Error).message
    throw err
  }
}
</script>
