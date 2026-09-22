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
      <iframe
        v-else-if="primaryYouTubeEmbedLink"
        class="w-full h-full"
        type="text/html"
        :title="t('trick.videoTitle')"
        allow="autoplay; picture-in-picture"
        allowfullscreen
        :src="primaryYouTubeEmbedLink"
      />
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
import useLanguage from '../hooks/useLanguage'

import type { PropType } from 'vue'
import type MuxPlayerElement from '@mux/mux-player'
import type { TrickBySlugQuery } from '../graphql/generated/graphql'

type Video = NonNullable<TrickBySlugQuery['trick']>['videos'][number]
type Speed = 'full' | 'slow'

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

const { t } = useI18n()
const { user } = useAuth()
const { lang } = useLanguage()
const cookieConsent = useCookieConsent()

const player = useTemplateRef<MuxPlayerElement>('player')

/** The rate the speed buttons hold the playback at, null while the two alternate */
const speed = ref<Speed | null>(null)
/** Plays finished in the current cycle */
const plays = ref(0)

/** The video of this host whose type comes first in the given order */
function preferred (host: VideoHost, types: VideoType[]) {
  const hosted = props.videos.filter(video => video.host === host)
  for (const type of types) {
    const video = hosted.find(video => video.type === type)
    if (video) return video
  }
  return null
}

// Prefer the self-hosted Mux video, fall back to YouTube for tricks that
// haven't been migrated yet
const muxVideo = computed(() => preferred(VideoHost.Mux, [VideoType.FullSpeed, VideoType.SlowMo]))

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

const primaryYouTubeEmbedLink = computed(() => {
  // the reverse of the Mux order: an embed can't be slowed down, so an edited clip is the better watch here
  const video = preferred(VideoHost.YouTube, [VideoType.SlowMo, VideoType.FullSpeed])
  if (!video) return null
  const params = new URLSearchParams()
  params.append('hl', lang.value)
  params.append('origin', window.location.origin)
  params.append('playsinline', '1')
  params.append('rel', '0')
  params.append('loop', '1')
  params.append('autoplay', '1')

  return `https://www.youtube.com/embed/${video.videoId}?${params.toString()}`
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
