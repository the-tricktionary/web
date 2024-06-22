<template>
  <section class="container mx-auto px-2 mt-4">
    <h2>About the Tricktionary</h2>

    <p>
      The sport of competitive jump roping is a continually growing
      international community of some of the world's most talented athletes.
      This app aims to help anyone hoping to become involved in this phenomenal
      sport by giving anyone with a phone the power to learn all levels and
      types of jump rope skills. The Tricktionary is organized by type
      (Basics, Multiples, Power, Rope Manipulation, Releases...) and by level.
      It provides a description, a video, prerequisites, and what to learn next
      for each trick.
    </p>

    <p>
      A powerful tool pioneered by the Tricktionary is the speed timer.
      With this tool you can time and click speed and be provided with useful
      statistics about the event. The app displays score, speed, number of
      misses, an estimated score assuming no misses occurred, and a graph of the
      jumper's instantaneous speed throughout the entire event.
    </p>

    <p>
      Also included in the Android™ app is the Show Writer. This enables coaches
      and jumpers to quickly write jump rope shows in which each athlete has the
      maximum amount of break time between each of their routines.
    </p>

    <p>
      The tricktionary is currently available as an Android™ app and as this
      webapp, an iOS® app is comming soon. If you want to help build the
      tricktionary, please email
      <a href="develop@the-tricktionary.com">develop@the-tricktionary.com</a>.
      Our code is open-source under the MIT license and available on
      <a href="https://github.com/the-tricktionary" rel="noopener">GitHub</a>.
    </p>

    <p>
      As a few last words, if you believe this service is something that we
      should continue working on, please feel free to share the Tricktionary
      with friends! Or consider a small donation to help us pay the
      administrative costs. Check out our shop for products that helps us pay
      the bills too.
    </p>
  </section>

  <links />

  <rope-score-ad />

  <section class="container mx-auto px-2 mt-4">
    <h2>The Rafiki Outreach Program</h2>

    <p>
      the Tricktionary is a proud supporter of the
      <router-link to="/rafiki">
        Rafiki Outreach Program
      </router-link>.
    </p>
  </section>
</template>

<script setup lang="ts">
import Links from './Links.vue'
import RopeScoreAd from './AdRopeScore.vue';
</script>
