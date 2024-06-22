<template>
  <div class="w-full aspect-w-9/16 mx-auto bg-gray-300">
    <iframe
      v-if="primaryYouTubeEmbedLink"
      type="text/html"
      :src="primaryYouTubeEmbedLink"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { VideoHost, VideoType } from '../graphql/generated/graphql'
import useAuth from '../hooks/useAuth'

import type { PropType } from 'vue'
import type { Video } from '../graphql/generated/graphql'

const props = defineProps({
  videos: {
    required: true,
    type: Object as PropType<Array<Pick<Video, 'type' | 'host' | 'videoId'>>>
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
