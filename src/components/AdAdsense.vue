<template>
  <!-- tT flow v4 -->
  <div class="container mx-auto px-2">
    <div class="overflow-x-auto bg-gray-100">
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-7956758256491526"
        data-ad-slot="4238944283"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
    <p class="text-center mb-2">The above content is an ad</p>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@vueuse/head'
; ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})

useHead({
  script: [
    { adync: true, src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' }
  ]
})
</script>
