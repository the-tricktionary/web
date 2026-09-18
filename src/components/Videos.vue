<template>
  <div class="w-full aspect-video mx-auto bg-gray-300">
    <iframe
      v-if="primaryYouTubeEmbedLink"
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

import { VideoHost, VideoType } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'

import type { PropType } from 'vue'
import type { TrickBySlugQuery } from '../graphql/generated/graphql'

type Video = NonNullable<TrickBySlugQuery['trick']>['videos'][number]

const props = defineProps({
  videos: {
    required: true,
    type: Array as PropType<Video[]>
  }
})

const { user } = useAuth()

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
