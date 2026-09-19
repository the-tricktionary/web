<template>
  <div class="container mx-auto px-2 py-4" :class="{ 'mb-20': showBottomBar }">
    <!-- Setup -->
    <form v-if="phase === 'setup'" :id="formId" class="flex flex-col gap-4 max-w-120" @submit.prevent="begin()">
      <h1>{{ t('speed.count.title') }}</h1>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.count.event') }}</span>
        <event-picker v-model="eventDefinitionId" mark-audio allow-custom required />
        <span class="text-muted text-sm">{{ t('speed.count.trackHint') }}</span>
      </label>

      <custom-event-fields
        v-if="isCustom"
        v-model:name="customName"
        v-model:total-duration="customDuration"
        v-model:cues="cues"
        v-model:opening-label="openingLabel"
        v-model:valid="customValid"
      />

      <label v-if="event?.timingTrack?.audioUrl" class="flex items-center gap-2">
        <input v-model="useTrack" type="checkbox">
        <span>{{ t('speed.count.playTrack') }}</span>
      </label>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.create.name') }} <span class="text-muted font-normal">{{ t('speed.create.optional') }}</span></span>
        <input v-model="name" type="text" maxlength="120" :placeholder="t('speed.create.namePlaceholder')" class="rounded">
      </label>
    </form>

    <!-- Counting -->
    <div v-else-if="phase === 'counting'" class="flex flex-col items-center gap-3 select-none min-h-[calc(100dvh-7rem)]">
      <p class="text-muted font-semibold m-0">
        {{ event?.name }}
      </p>

      <p v-if="segments.length > 1" class="m-0 flex items-baseline gap-2" aria-live="polite" aria-atomic="true">
        <span class="font-semibold">{{ currentSegment?.label ?? t('speed.count.segment', { n: segmentNumber }) }}</span>
        <span class="text-muted text-sm tabular-nums">{{ t('speed.count.segmentOf', { n: segmentNumber, total: segments.length }) }}</span>
      </p>

      <p class="text-5xl font-bold tabular-nums m-0" aria-live="off">
        <template v-if="!started">
          {{ waitingForTrack ? t('speed.count.ready') : seconds(event?.totalDuration ?? 0) }}
        </template>
        <template v-else-if="clock < 0">
          {{ seconds(clock, { tenths: true }) }}
        </template>
        <template v-else>
          {{ seconds(remaining ?? clock, { tenths: true }) }}
        </template>
      </p>

      <p class="flex items-baseline gap-2 m-0" aria-live="polite" aria-atomic="true">
        <span class="text-7xl font-bold leading-none">{{ number(count) }}</span>
        <span class="text-muted">{{ t('speed.steps') }}</span>
      </p>

      <!--
        Scaled rather than resized: a transform stays on the compositor, so
        these cost nothing next to the tap handler even at ten ticks a second.
      -->
      <div v-if="started && (remaining ?? 0) >= 0" class="w-full max-w-120 flex flex-col gap-1">
        <div class="h-2 rounded bg-elevated overflow-hidden">
          <div
            class="h-full bg-ttred-500 origin-left transition-transform duration-100 ease-linear"
            :style="{ transform: `scaleX(${eventProgress})` }"
            role="progressbar"
            :aria-label="t('speed.count.eventProgress')"
            :aria-valuenow="Math.round(eventProgress * 100)"
          />
        </div>
        <div v-if="segments.length > 1" class="h-1 rounded bg-elevated overflow-hidden">
          <div
            class="h-full bg-ttred-900 origin-left transition-transform duration-100 ease-linear"
            :style="{ transform: `scaleX(${segmentProgress})` }"
            role="progressbar"
            :aria-label="t('speed.count.segmentProgress')"
            :aria-valuenow="Math.round(segmentProgress * 100)"
          />
        </div>
      </div>

      <!-- Above the tap target, so a thumb reaching for a step cannot hit them -->
      <div class="grid grid-cols-2 gap-2 w-full max-w-120">
        <button type="button" class="btn" :disabled="!counting || count === 0" @click="undo()">
          {{ t('speed.count.undo') }}
        </button>
        <button type="button" class="btn" :disabled="!started" @click="finish()">
          {{ t('speed.count.stop') }}
        </button>
      </div>

      <button
        type="button"
        class="w-full max-w-120 flex-1 min-h-60 rounded-lg text-3xl font-bold text-white bg-ttred-500 border-2 border-ttred-900 touch-manipulation active:bg-ttred-900 disabled:bg-elevated disabled:text-muted disabled:border-line"
        :disabled="finished || loadingTrack"
        @pointerdown.prevent="tap()"
        @touchmove.prevent
        @click.prevent
      >
        <template v-if="loadingTrack">
          {{ t('speed.count.loadingTrack') }}
        </template>
        <template v-else-if="!started">
          {{ t('speed.count.tapToStart') }}
        </template>
        <template v-else-if="clock < 0">
          {{ t('speed.count.ready') }}
        </template>
        <template v-else>
          {{ t('speed.count.step') }}
        </template>
      </button>
    </div>

    <!-- Done -->
    <div v-else class="flex flex-col gap-4 max-w-120">
      <h1>{{ event?.name }}</h1>
      <p class="flex items-baseline gap-2">
        <span class="text-6xl font-bold leading-none">{{ number(count) }}</span>
        <span class="text-muted">{{ t('speed.count.stepsIn', { time: seconds(elapsed, { tenths: true }) }) }}</span>
      </p>
    </div>
  </div>

  <!--
    The audio lives outside the phases so it starts buffering as soon as an
    event is picked, and keeps its buffer across the setup and counting steps.
  -->
  <audio
    v-if="trackUrl"
    ref="audioRef"
    :src="trackUrl"
    preload="auto"
    @canplaythrough="audioReady = true"
    @error="audioFailed = true"
    @playing="onPlaying"
    @ended="finish()"
  />

  <bottom-bar v-if="phase === 'done' && error">
    <p class="text-ttred-900 mb-0" role="alert">
      {{ t('speed.count.failed', { error }) }}
    </p>
  </bottom-bar>

  <bottom-bar v-if="showBottomBar">
    <button
      v-if="phase === 'done'"
      type="button"
      class="btn grid grid-cols-[2rem_auto] w-max mt-0"
      :disabled="saving"
      @click="discard()"
    >
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-close />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.count.discard') }}</span>
    </button>
    <router-link v-else :to="{ name: 'speed' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.allScores') }}</span>
    </router-link>

    <button
      v-if="phase === 'setup'"
      type="submit"
      :form="formId"
      class="btn grid grid-cols-[2rem_auto] w-max mt-0 ml-auto"
      :disabled="!canBegin"
    >
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-timer />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.count.getReady') }}</span>
    </button>

    <button
      v-else-if="phase === 'done'"
      type="button"
      class="btn grid grid-cols-[2rem_auto] w-max mt-0 ml-auto"
      :disabled="saving"
      @click="save()"
    >
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-loading v-if="saving" class="animate-spin" />
        <icon-content-save v-else />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.count.save') }}</span>
    </button>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useIntervalFn, useWakeLock } from '@vueuse/core'
import { getAnalytics, logEvent } from '@firebase/analytics'
import { createMarkReducer, simpleReducer } from '@ropescore/rulesets'

import { TimingCueType, useCreateSpeedResultMutation } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useEventDefinitions from '../hooks/useEventDefinitions'
import useSpeedFormat from '../hooks/useSpeedFormat'
import { addSpeedResultToCache } from '../hooks/useSpeedResults'
import { CUSTOM_EVENT, segmentsOf, switchCuesInput } from '../helpers'

import BottomBar from '../components/BottomBar.vue'
import CustomEventFields from '../components/CustomEventFields.vue'
import EventPicker from '../components/EventPicker.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'
import IconContentSave from '~icons/mdi/content-save'
import IconClose from '~icons/mdi/close'
import IconTimer from '~icons/mdi/timer-outline'

import type { SpeedMarkInput } from '../graphql/generated/graphql'
import type { SwitchRow } from '../helpers'

const { t } = useI18n()
const { number, seconds } = useSpeedFormat()

/** Lets the get-ready button live in the bottom bar, outside the form element */
const formId = useId()

useHead({ title: computed(() => t('speed.count.title')) })

const router = useRouter()
const analytics = getAnalytics()
const { user } = useAuth()

// --- setup

const { eventDefinitions } = useEventDefinitions()
const eventDefinitionId = ref('')
const isCustom = computed(() => eventDefinitionId.value === CUSTOM_EVENT)

const customName = ref('')
const customDuration = ref<number>(30)
const cues = ref<SwitchRow[]>([])
const openingLabel = ref('')
const customValid = ref(false)

const selectedEvent = computed(() => eventDefinitions.value.find(eventDefinition => eventDefinition.id === eventDefinitionId.value))

/**
 * The event being counted, whichever kind it is. A custom one has no
 * document and no audio, but it still has a duration to run the clock
 * against and switches to split the result by.
 */
const event = computed(() => isCustom.value
  ? { name: customName.value.trim(), totalDuration: customDuration.value, timingTrack: null }
  : selectedEvent.value ?? null
)
const canBegin = computed(() => isCustom.value ? customValid.value : selectedEvent.value != null)

/** Whatever divides the event into stretches, from either kind of event */
const activeCues = computed(() => isCustom.value
  ? (switchCuesInput(cues.value, openingLabel.value).cues ?? [])
  : selectedEvent.value?.timingTrack?.cues ?? []
)

const useTrack = ref(true)
const name = ref('')

// --- counting

type Phase = 'setup' | 'counting' | 'done'
const phase = ref<Phase>('setup')

/** The marks in the rulesets shape, timestamps in epoch milliseconds */
const marks = ref<SpeedMarkInput[]>([])
const started = ref(false)
const finished = ref(false)
/** Epoch ms of the 'start' mark: the first tap, or the moment the audio began */
const startedAt = ref<number | null>(null)
const now = ref(Date.now())

const audioRef = useTemplateRef('audioRef')
const audioReady = ref(false)
const audioFailed = ref(false)
const wakeLock = useWakeLock()

/**
 * An event may carry cues without any audio, so playing a track and storing
 * one are separate questions: only audio can be played, but the cues are
 * worth keeping either way, since they are what splits a relay by athlete.
 */
const playback = computed(() => useTrack.value && !audioFailed.value ? event.value?.timingTrack ?? null : null)
const trackUrl = computed(() => useTrack.value ? event.value?.timingTrack?.audioUrl ?? null : null)
const startCueOffset = computed(() => playback.value?.cues.find(cue => cue.type === TimingCueType.Start)?.offset ?? 0)

/**
 * A track that pauses to buffer mid-count would silently stretch the event,
 * so the count cannot begin until the whole file is known to play through.
 */
const waitingForTrack = computed(() => trackUrl.value != null && !audioFailed.value)
const loadingTrack = computed(() => waitingForTrack.value && !audioReady.value)

/**
 * The same reducer the API scores with, so the running total the athlete
 * sees is the one their result will be saved with, undos included.
 */
const count = computed(() => {
  const reducer = createMarkReducer<string, string>(simpleReducer)
  for (const mark of marks.value) reducer.addMark(mark)
  return Math.max(0, Math.round(reducer.tally.step ?? 0))
})

/** Seconds since the go signal, negative during a track's lead-in */
const clock = computed(() => startedAt.value == null ? 0 : (now.value - startedAt.value - startCueOffset.value) / 1000)
const remaining = computed(() => {
  const totalDuration = event.value?.totalDuration ?? 0
  if (totalDuration <= 0 || clock.value < 0) return null
  return Math.max(0, totalDuration - clock.value)
})
const elapsed = computed(() => Math.max(0, clock.value))

/**
 * The stretches the event is divided into, and which one the clock is in.
 * Only the cues matter here, so a custom relay and one with an official
 * track are read the same way.
 */
const segments = computed(() => segmentsOf(event.value?.totalDuration ?? 0, activeCues.value))
const currentSegment = computed(() => {
  if (clock.value < 0) return segments.value[0]
  return segments.value.find(segment => clock.value >= segment.start && clock.value < segment.end) ??
    segments.value[segments.value.length - 1]
})
const segmentNumber = computed(() => (currentSegment.value?.index ?? 0) + 1)

const fraction = (value: number, of: number) => of > 0 ? Math.min(1, Math.max(0, value / of)) : 0
const eventProgress = computed(() => fraction(elapsed.value, event.value?.totalDuration ?? 0))
const segmentProgress = computed(() => {
  const segment = currentSegment.value
  if (!segment) return 0
  return fraction(elapsed.value - segment.start, segment.end - segment.start)
})

/** Steps only count once the go signal has sounded */
const counting = computed(() => started.value && !finished.value && clock.value >= 0)
/** Leaving mid-count is an accident waiting to happen, so the bar goes away */
const showBottomBar = computed(() => phase.value !== 'counting' || !started.value)

const ticker = useIntervalFn(() => {
  now.value = Date.now()
  // with no audio to end the event, it ends itself when its time is up
  if (!playback.value && remaining.value === 0) finish()
}, 100, { immediate: false })

// a different event means a different file to buffer
watch(trackUrl, () => {
  audioReady.value = false
  audioFailed.value = false
})

function addMark (mark: Omit<SpeedMarkInput, 'sequence' | 'timestamp'>) {
  marks.value.push({ sequence: marks.value.length, timestamp: Date.now(), ...mark })
}

function begin () {
  if (!canBegin.value) return
  marks.value = []
  started.value = false
  finished.value = false
  startedAt.value = null
  phase.value = 'counting'
  void wakeLock.request('screen')
}

/**
 * The tap target is also the start button: without a track the first tap
 * starts the event and counts as the first step, with one it starts the
 * audio and taps are ignored until the go signal.
 */
function tap () {
  if (finished.value || loadingTrack.value) return
  if (!started.value) {
    void start()
    return
  }
  if (!counting.value) return
  addMark({ schema: 'step' })
  navigator.vibrate?.(40)
}

async function start () {
  started.value = true
  if (playback.value && audioRef.value) {
    try {
      await audioRef.value.play()
      // the 'start' mark is placed by onPlaying, when the audio really runs
      return
    } catch {
      // autoplay refused: fall back to counting without the track
      audioFailed.value = true
    }
  }
  startedAt.value = Date.now()
  addMark({ schema: 'start' })
  // no lead-in to wait through, so this tap is the first step
  addMark({ schema: 'step' })
  ticker.resume()
  navigator.vibrate?.(75)
}

/** The audio has actually started, so its position tells us when t=0 of the track was */
function onPlaying () {
  if (startedAt.value != null || !audioRef.value) return
  const audioStart = Date.now() - audioRef.value.currentTime * 1000
  startedAt.value = audioStart
  marks.value.push({ sequence: marks.value.length, timestamp: Math.round(audioStart), schema: 'start' })
  ticker.resume()
}

function undo () {
  const last = [...marks.value].reverse().find(mark => mark.schema === 'step')
  if (!last || count.value === 0) return
  addMark({ schema: 'undo', target: last.sequence })
}

function finish () {
  if (finished.value) return
  finished.value = true
  ticker.pause()
  audioRef.value?.pause()
  navigator.vibrate?.(500)
  void wakeLock.release()
  phase.value = 'done'
}

function discard () {
  phase.value = 'setup'
}

// --- saving

const error = ref<string | null>(null)
const { mutate, loading: saving } = useCreateSpeedResultMutation(() => ({
  update (cache, { data }) {
    if (data?.createSpeedResult && user.value) addSpeedResultToCache(cache, user.value.id, data.createSpeedResult)
  }
}))

async function save () {
  if (!canBegin.value || saving.value) return
  error.value = null
  try {
    const result = await mutate({
      data: {
        ...(isCustom.value
          ? {
              eventDefinition: {
                name: customName.value.trim(),
                totalDuration: customDuration.value,
                ...switchCuesInput(cues.value, openingLabel.value)
              }
            }
          : {
              eventDefinitionId: selectedEvent.value!.id,
              // a custom event's switches ride along on the definition itself
              withTimingTrack: selectedEvent.value!.timingTrack != null
            }),
        marks: marks.value,
        ...(name.value.trim() ? { name: name.value.trim() } : {})
      }
    })
    const created = result?.data?.createSpeedResult
    if (!created) throw new Error('No result returned')
    logEvent(analytics, 'post_score', { score: created.count, level_name: created.eventDefinition.name })
    await router.replace({ name: 'speed-details', params: { id: created.id } })
  } catch (err) {
    error.value = (err as Error).message
    throw err
  }
}

watch(phase, value => {
  if (value !== 'counting') void wakeLock.release()
})

onBeforeUnmount(() => {
  ticker.pause()
  void wakeLock.release()
})
</script>
