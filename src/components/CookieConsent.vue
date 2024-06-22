<template>
  <bottom-bar v-if="cookie.granted.value === null" class="border-t bg-white border-gray-300 py-4">
    <div class="container mx-auto px-2">
      <h2>Cookies</h2>
      <p>
        We would like to use cookies to collect anonymous aggregated usage
        statistics to know what features to improve.
        Read more in our <router-link to="/policies">
          privacy policy
        </router-link>.
      </p>
      <div class="flex gap-4 flex-wrap mt-2">
        <button
          id="accept-cookies"
          class="btn w-full sm:w-auto"
          @click="cookie.grant()"
        >
          I accept cookies
        </button>
        <button
          id="deny-cookies"
          class="btn w-full sm:w-auto"
          @click="cookie.deny()"
        >
          I deny cookies
        </button>
      </div>
    </div>
  </bottom-bar>
</template>

<script setup lang="ts">
import useConsentCookie from "../hooks/useCookieConsent"
import BottomBar from "./BottomBar.vue"

const cookie = useConsentCookie()
</script>
