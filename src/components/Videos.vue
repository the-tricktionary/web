<template>
  <div class="w-full aspect-video mx-auto bg-gray-300">
    <mux-player
      v-if="muxVideo"
      class="w-full h-full"
      :playback-id="muxVideo.videoId"
      stream-type="on-demand"
      autoplay="muted"
      loop
      playsinline
      accent-color="#fe3500"
      :title="title"
      :metadata-video-id="trickId"
      :metadata-video-title="title"
      :metadata-viewer-user-id="cookieConsent.granted.value && user?.id ? user.id : undefined"
      :disable-cookies="cookieConsent.granted.value ? undefined : ''"
    />
    <iframe
      v-else-if="primaryYouTubeEmbedLink"
      class="w-full h-full"
      type="text/html"
      title="Video of the trick"
      allow="autoplay; picture-in-picture"
      allowfullscreen
      :src="primaryYouTubeEmbedLink"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import '@mux/mux-player'

import { VideoHost, VideoType } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'
import useCookieConsent from '../hooks/useCookieConsent'

import type { PropType } from 'vue'
import type { TrickBySlugQuery } from '../graphql/generated/graphql'

type Video = NonNullable<TrickBySlugQuery['trick']>['videos'][number]

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

const { user } = useAuth()
const cookieConsent = useCookieConsent()

// Prefer the self-hosted Mux video, fall back to YouTube for tricks that
// haven't been migrated yet
const muxVideo = computed(() => {
  return props.videos.find(video => video.host === VideoHost.Mux && video.type === VideoType.SlowMo) ?? null
})

const primaryYouTubeEmbedLink = computed(() => {
  const video = props.videos.find(video => video.host === VideoHost.YouTube && video.type === VideoType.SlowMo)
  if (!video) return null
  const params = new URLSearchParams()
  if (user.value?.lang) params.append('hl', user.value.lang)
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
}
</style>
