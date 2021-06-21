<template>
  <div class="container mx-auto px-2 mt-4 flex flex-wrap flex-row items-start justify-center gap-4">
    <a class="btn w-max min-w-[5rem] text-center inline-block" target="_blank" rel="noopener" href="http://fb.me/jumpropetricktionary">
      Facebook
    </a>
    <a class="btn w-max min-w-[5rem] text-center inline-block" target="_blank" rel="noopener" href="http://instagram.com/jumpropetricktionary">
      Instagram
    </a>

    <a
      target="_blank"
      rel="noopener"
      class="btn w-max min-w-[5rem] text-center inline-block"
      href="https://play.google.com/store/apps/details?id=trictionary.jumproper.com.jumpropetrictionary"
    >
      Google Play
    </a>
    <!-- <a target="_blank" rel="noopener" href="">
        <button>App Store</button>
    </a> -->

    <a
      href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WVNM754ZP3DB2"
      target="_blank"
      rel="noopener"
      class="btn w-max min-w-[5rem] text-center inline-block"
      @click="logDonation()"
    >
      Donate
    </a>
    <router-link to="/shop" class="btn w-max min-w-[5rem] text-center inline-block">Shop</router-link>
  </div>
</template>

<script setup lang="ts">
import { getAnalytics, logEvent } from '@firebase/analytics'

const analytics = getAnalytics()

function logDonation () {
  logEvent(analytics, 'donate')
}
</script>
