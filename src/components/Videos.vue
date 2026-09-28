<template>
  <div>
    <div class="w-full aspect-video mx-auto bg-placeholder isolate">
      <mux-player
        v-if="muxVideo"
        ref="player"
        class="w-full h-full"
        :playback-id="muxVideo.videoId"
        stream-type="on-demand"
        autoplay="muted"
        playsinline
        accent-color="#fe3500"
        :title="title"
        :metadata-video-id="trickId"
        :metadata-video-title="title"
        :metadata-viewer-user-id="cookieConsent.granted.value && user?.id ? user.id : undefined"
        :disable-cookies="cookieConsent.granted.value ? undefined : ''"
        @ended="playAgain()"
        @play="restartFinishedCycle()"
      />
      <div v-else class="h-full flex flex-col items-center justify-center gap-3 p-4 text-center">
        <p class="text-muted mb-0">
          {{ t('trick.videos.missing') }}
        </p>
        <button type="button" class="btn w-max inline-flex items-center gap-2" @click="emit('submit')">
          <icon-upload aria-hidden="true" />
          {{ t('trick.videos.submit') }}
        </button>
      </div>
    </div>

    <div v-if="muxVideo" class="flex flex-wrap gap-2 items-center mt-2">
      <div v-if="playable.length > 1" class="flex gap-2 items-center" role="group" :aria-label="t('trick.videos.label')">
        <button
          type="button"
          class="btn w-max touch-target flex items-center justify-center"
          :aria-label="t('trick.videos.previous')"
          @click="step(-1)"
        >
          <icon-chevron-left aria-hidden="true" />
        </button>
        <span>{{ t('trick.videos.counter', { current: index + 1, total: playable.length }) }}</span>
        <button
          type="button"
          class="btn w-max touch-target flex items-center justify-center"
          :aria-label="t('trick.videos.next')"
          @click="step(1)"
        >
          <icon-chevron-right aria-hidden="true" />
        </button>
      </div>

      <button type="button" class="btn w-max touch-target inline-flex items-center gap-2 ml-auto" @click="emit('submit')">
        <icon-upload aria-hidden="true" />
        {{ t('trick.videos.submit') }}
      </button>
    </div>

    <div v-if="canChooseSpeed" class="flex gap-2 mt-2" role="group" :aria-label="t('trick.playback.label')">
      <button
        type="button"
        class="btn speed w-max"
        :aria-pressed="speed === 'full'"
        @click="chooseSpeed('full')"
      >
        {{ t('trick.playback.full') }}
      </button>
      <button
        type="button"
        class="btn speed w-max"
        :aria-pressed="speed === 'slow'"
        @click="chooseSpeed('slow')"
      >
        {{ t('trick.playback.slow') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import '@mux/mux-player'

import { VideoHost, VideoType } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useCookieConsent from '../hooks/useCookieConsent'

import IconChevronLeft from '~icons/mdi/chevron-left'
import IconChevronRight from '~icons/mdi/chevron-right'
import IconUpload from '~icons/mdi/upload'

import type { PropType } from 'vue'
import type MuxPlayerElement from '@mux/mux-player'
import type { TrickBySlugQuery } from '../graphql/generated/graphql'

type Video = NonNullable<TrickBySlugQuery['trick']>['videos'][number]
type Speed = 'full' | 'slow'

/** The types the player shows, the rest explain rather than show the trick */
const PLAYABLE_TYPES: VideoType[] = [VideoType.FullSpeed, VideoType.SlowMo]
const SLOW_RATE = 0.5
/** Rounds a video plays before the player stops, a round being a pair while the speeds alternate */
const ROUNDS = 5

const props = defineProps({
  videos: {
    required: true,
    type: Array as PropType<Video[]>
  },
  trickId: {
    type: String,
    default: undefined
  },
  title: {
    type: String,
    default: undefined
  }
})

const emit = defineEmits<{
  /** The viewer wants to submit a video of the trick */
  submit: []
}>()

const { t } = useI18n()
const { user } = useAuth()
const cookieConsent = useCookieConsent()

const player = useTemplateRef<MuxPlayerElement>('player')

/** The rate the speed buttons hold the playback at, null while the two alternate */
const speed = ref<Speed | null>(null)
/** Plays finished in the current cycle */
const plays = ref(0)

/** In the order the trick keeps them, which editors arrange */
const playable = computed(() => props.videos.filter(video => video.host === VideoHost.Mux && PLAYABLE_TYPES.includes(video.type)))

const picked = ref(0)
// clamped, in case the list shrinks under it
const index = computed(() => Math.min(picked.value, Math.max(0, playable.value.length - 1)))
const muxVideo = computed(() => playable.value[index.value] ?? null)

function step (by: number) {
  picked.value = (index.value + by + playable.value.length) % playable.value.length
}

// Trick.vue keeps this component mounted across route updates, so another trick starts at its first video
watch(() => props.trickId, () => {
  picked.value = 0
})

// A FullSpeed video is one run at natural speed, so the slow motion is ours to play
const canChooseSpeed = computed(() => muxVideo.value?.type === VideoType.FullSpeed)
const alternating = computed(() => canChooseSpeed.value && speed.value === null)
const cyclePlays = computed(() => alternating.value ? ROUNDS * 2 : ROUNDS)

function rateFor (play: number) {
  if (!alternating.value) return speed.value === 'slow' ? SLOW_RATE : 1
  return play % 2 === 0 ? 1 : SLOW_RATE
}

/** Starts the next play of the cycle, leaving the player paused at the end of the last one */
function playAgain () {
  plays.value += 1
  if (!player.value || plays.value >= cyclePlays.value) return
  player.value.playbackRate = rateFor(plays.value)
  // mux-video fires a synthetic ended near the end of a stalled stream, where play() alone wouldn't rewind
  player.value.currentTime = 0
  void player.value.play()
}

// playAgain only calls play() while plays is below cyclePlays, so a finished cycle means the viewer pressed play
function restartFinishedCycle () {
  if (plays.value < cyclePlays.value) return
  plays.value = 0
  if (player.value) player.value.playbackRate = rateFor(0)
}

function chooseSpeed (choice: Speed) {
  const finished = plays.value >= cyclePlays.value
  speed.value = speed.value === choice ? null : choice
  plays.value = 0
  if (!player.value) return
  player.value.playbackRate = rateFor(0)
  if (!finished) return
  player.value.currentTime = 0
  void player.value.play()
}

// Trick.vue keeps this component mounted across route updates, so a new video must reset the cycle
watch(() => muxVideo.value?.videoId, () => {
  speed.value = null
  plays.value = 0
})
</script>

<style scoped>
mux-player {
  --captions-button: none;
  --airplay-button: none;
  --cast-button: none;
  --pip-button: none;
  /* the cycle owns the rate */
  --playback-rate-button: none;
}

.speed[aria-pressed='true'] {
  @apply bg-elevated font-semibold;
}
</style>
