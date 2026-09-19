<template>
  <div class="container mx-auto px-2 py-4 mb-20">
    <!-- Setup -->
    <form v-if="phase === 'setup'" class="flex flex-col gap-4 max-w-120" @submit.prevent="begin()">
      <h1>{{ t('speed.count.title') }}</h1>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.count.event') }}</span>
        <select v-model="eventDefinitionId" required class="rounded">
          <optgroup v-for="group of eventGroups" :key="group.label" :label="group.label">
            <option v-for="eventDefinition of group.eventDefinitions" :key="eventDefinition.id" :value="eventDefinition.id">
              {{ eventDefinition.name }}{{ eventDefinition.timingTrack ? ' ♪' : '' }}
            </option>
          </optgroup>
        </select>
        <span class="text-muted text-sm">{{ t('speed.count.trackHint') }}</span>
      </label>

      <label v-if="selectedEvent?.timingTrack" class="flex items-center gap-2">
        <input v-model="useTrack" type="checkbox">
        <span>{{ t('speed.count.playTrack') }}</span>
      </label>

      <label class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('speed.create.name') }} <span class="text-muted font-normal">{{ t('speed.create.optional') }}</span></span>
        <input v-model="name" type="text" maxlength="120" :placeholder="t('speed.create.namePlaceholder')" class="rounded">
      </label>

      <button type="submit" class="btn" :disabled="!selectedEvent">
        {{ t('speed.count.getReady') }}
      </button>
    </form>

    <!-- Counting -->
    <div v-else-if="phase === 'counting'" class="flex flex-col items-center gap-4 select-none">
      <p class="text-muted font-semibold m-0">
        {{ selectedEvent?.name }}
      </p>

      <p class="text-5xl font-bold tabular-nums m-0" aria-live="off">
        <template v-if="!started">
          {{ useTrack ? t('speed.count.ready') : seconds(selectedEvent?.totalDuration ?? 0) }}
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

      <button
        type="button"
        class="w-full max-w-120 h-60 rounded-lg text-3xl font-bold text-white bg-ttred-500 border-2 border-ttred-900 touch-manipulation active:bg-ttred-900 disabled:bg-elevated disabled:text-muted disabled:border-line"
        :disabled="!started || finished"
        @pointerdown.prevent="step()"
        @touchmove.prevent
        @click.prevent
      >
        {{ started ? t('speed.count.step') : t('speed.count.pressStart') }}
      </button>

      <div class="grid grid-cols-2 gap-2 w-full max-w-120">
        <button v-if="!started" type="button" class="btn col-span-2" @click="start()">
          {{ t('speed.count.start') }}
        </button>
        <template v-else>
          <button type="button" class="btn" :disabled="count === 0" @click="undo()">
            {{ t('speed.count.undo') }}
          </button>
          <button type="button" class="btn" @click="finish()">
            {{ t('speed.count.stop') }}
          </button>
        </template>
      </div>

      <audio
        v-if="useTrack && selectedEvent?.timingTrack"
        ref="audioRef"
        :src="selectedEvent.timingTrack.audioUrl"
        preload="auto"
        @playing="onPlaying"
        @ended="finish()"
      />
    </div>

    <!-- Done -->
    <div v-else class="flex flex-col gap-4 max-w-120">
      <h1>{{ selectedEvent?.name }}</h1>
      <p class="flex items-baseline gap-2">
        <span class="text-6xl font-bold leading-none">{{ number(count) }}</span>
        <span class="text-muted">{{ t('speed.count.stepsIn', { time: seconds(elapsed, { tenths: true }) }) }}</span>
      </p>

      <p v-if="error" class="text-ttred-900" role="alert">
        {{ t('speed.count.failed', { error }) }}
      </p>

      <button type="button" class="btn" :disabled="saving" @click="save()">
        <icon-loading v-if="saving" class="animate-spin inline-block" aria-hidden="true" />
        <span v-else>{{ t('speed.count.save') }}</span>
      </button>
      <button type="button" class="btn" :disabled="saving" @click="discard()">
        {{ t('speed.count.discard') }}
      </button>
    </div>
  </div>

  <bottom-bar>
    <router-link :to="{ name: 'speed' }" class="btn grid grid-cols-[2rem_auto] w-max mt-0">
      <span class="flex h-full items-center justify-center" aria-hidden="true">
        <icon-chevron-left />
      </span>
      <span class="flex px-2 items-center">{{ t('speed.allScores') }}</span>
    </router-link>
  </bottom-bar>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useIntervalFn, useWakeLock } from '@vueuse/core'
import { getAnalytics, logEvent } from '@firebase/analytics'

import { TimingCueType, useCreateSpeedResultMutation, useEventDefinitionsQuery } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useSpeedFormat from '../hooks/useSpeedFormat'
import { addSpeedResultToCache } from '../hooks/useSpeedResults'

import BottomBar from '../components/BottomBar.vue'
import IconLoading from '~icons/mdi/loading'
import IconChevronLeft from '~icons/mdi/chevron-left'

import type { EventDefinitionsQuery, SpeedMarkInput } from '../graphql/generated/graphql'

const { t } = useI18n()
const { duration, number, seconds } = useSpeedFormat()

useHead({ title: computed(() => t('speed.count.title')) })

const router = useRouter()
const analytics = getAnalytics()
const { user } = useAuth()

// --- setup

const eventDefinitionsQuery = useEventDefinitionsQuery({ fetchPolicy: 'cache-and-network' })
const eventDefinitions = computed(() => eventDefinitionsQuery.result.value?.eventDefinitions ?? [])
const eventGroups = computed(() => {
  const groups = new Map<number, EventDefinitionsQuery['eventDefinitions']>()
  for (const eventDefinition of eventDefinitions.value) {
    const group = groups.get(eventDefinition.totalDuration) ?? []
    group.push(eventDefinition)
    groups.set(eventDefinition.totalDuration, group)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([totalDuration, defs]) => ({ label: duration(totalDuration), eventDefinitions: [...defs].sort((a, b) => a.name.localeCompare(b.name)) }))
})

const eventDefinitionId = ref('')
const selectedEvent = computed(() => eventDefinitions.value.find(eventDefinition => eventDefinition.id === eventDefinitionId.value))
const useTrack = ref(true)
const name = ref('')

// --- counting

type Phase = 'setup' | 'counting' | 'done'
const phase = ref<Phase>('setup')

/** The marks in the rulesets shape, timestamps in epoch milliseconds */
const marks = ref<SpeedMarkInput[]>([])
const undone = new Set<number>()
const started = ref(false)
const finished = ref(false)
/** Epoch ms of the 'start' mark: the start press, or the moment the audio began */
const startedAt = ref<number | null>(null)
const now = ref(Date.now())

const audioRef = useTemplateRef('audioRef')
const wakeLock = useWakeLock()

const track = computed(() => useTrack.value ? selectedEvent.value?.timingTrack ?? null : null)
const startCueOffset = computed(() => track.value?.cues.find(cue => cue.type === TimingCueType.Start)?.offset ?? 0)

const count = computed(() => marks.value.filter(mark => mark.schema === 'step' && !undone.has(mark.sequence)).length)

/** Seconds since the go signal, negative during a track's lead-in */
const clock = computed(() => startedAt.value == null ? 0 : (now.value - startedAt.value - startCueOffset.value) / 1000)
const remaining = computed(() => {
  const totalDuration = selectedEvent.value?.totalDuration ?? 0
  if (totalDuration <= 0 || clock.value < 0) return null
  return Math.max(0, totalDuration - clock.value)
})
const elapsed = computed(() => Math.max(0, clock.value))

const ticker = useIntervalFn(() => {
  now.value = Date.now()
  // without a track the event ends itself when its time is up
  if (!track.value && remaining.value === 0) finish()
}, 100, { immediate: false })

function addMark (mark: Omit<SpeedMarkInput, 'sequence' | 'timestamp'>) {
  marks.value.push({ sequence: marks.value.length, timestamp: Date.now(), ...mark })
}

function begin () {
  if (!selectedEvent.value) return
  marks.value = []
  undone.clear()
  started.value = false
  finished.value = false
  startedAt.value = null
  phase.value = 'counting'
  void wakeLock.request('screen')
}

async function start () {
  if (started.value) return
  started.value = true
  if (track.value && audioRef.value) {
    try {
      await audioRef.value.play()
      // the 'start' mark is placed by onPlaying, when the audio really runs
    } catch {
      // autoplay refused or the file is missing: fall back to counting without the track
      useTrack.value = false
      startManually()
    }
  } else {
    startManually()
  }
}

function startManually () {
  startedAt.value = Date.now()
  addMark({ schema: 'start' })
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

function step () {
  if (!started.value || finished.value) return
  addMark({ schema: 'step' })
  navigator.vibrate?.(40)
}

function undo () {
  const last = [...marks.value].reverse().find(mark => mark.schema === 'step' && !undone.has(mark.sequence))
  if (!last) return
  undone.add(last.sequence)
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
  if (!selectedEvent.value || saving.value) return
  error.value = null
  try {
    const result = await mutate({
      data: {
        eventDefinitionId: selectedEvent.value.id,
        marks: marks.value,
        withTimingTrack: track.value != null,
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
