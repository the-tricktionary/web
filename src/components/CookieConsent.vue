<template>
  <div v-if="cookie.granted.value === null" class="fixed bottom-0 right-0 left-0 border-t bg-white border-gray-300 py-4 z-10000">
    <div class="container mx-auto px-2">
      <h2>Cookies</h2>
      <p>
        We would like to use cookies to collect anonymous aggregated usage
        statistics to know what features to improve.
        Read more in our <router-link to="/policies">privacy policy</router-link>.
      </p>
      <div class="flex gap-4 flex-wrap mt-2">
        <button @click="cookie.grant()"
          class="btn w-full sm:w-auto"
        >I accept cookies</button>
        <button @click="cookie.deny()"
          class="btn w-full sm:w-auto"
        >I deny cookies</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useConsentCookie from "../hooks/useCookieConsent";

const cookie = useConsentCookie()
</script>
