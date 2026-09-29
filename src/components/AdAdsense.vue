<template>
  <aside class="ad" :aria-labelledby="labelId">
    <!-- "Advertisements" and "Sponsored Links" are the labels AdSense allows -->
    <p :id="labelId" class="text-muted text-sm mb-1">
      {{ t('ad.label') }}
    </p>
    <div class="overflow-x-auto bg-sunken min-h-24">
      <ins
        v-if="adsEnabled"
        class="adsbygoogle"
        style="display:block"
        :data-ad-client="AD_CLIENT"
        :data-ad-slot="adSlot"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import { AD_CLIENT, adsEnabled } from '../ads'

defineProps({
  /** The AdSense ad unit, one of AD_SLOTS */
  adSlot: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const labelId = useId()

// Fills the first unfilled <ins>, this one, so once per mounted slot
onMounted(() => {
  if (adsEnabled) (window.adsbygoogle ??= []).push({})
})
</script>

<style scoped>
/* AdSense marks a slot it has no ad for, and the label goes with it */
.ad:has(ins[data-ad-status="unfilled"]) {
  display: none;
}
</style>
