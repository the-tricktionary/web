<template>
  <div>
    <a id="v3" />
    <h2>the Tricktionary Update Progress</h2>
    <Progress :progress="0.33" />
    <p>
      As part of preparing for IJRU levels we decided to update to some more modern
      technology, which would also allow us to make room for Double Dutch and Wheels.
      We've been working on this since December 2018 but haven't been able to get all
      the way yet as we are maintaining the Tricktionary on a volunteer basis on the
      free time we have left.
    </p>
    <p>
      At the time of writing, the trick list is there and your checklists are there
      which we'd argue is the core functions of the Tricktionary, the Android app is
      still running the old version but your checklists are synced to the new version.
      (but you won't be able to see IJRU levels in the android app just yet)
    </p>
    <p>
      The speed timer in the android app is also syncing to the new version, and it'll
      return to the web version shortly. In the meantime you can use the old web version's
      speed timer, it is also synced to the new version.
    </p>
    <h3>What's missing from the web right now?</h3>
    <p>
      To be able to get IJRU levels to you in time to start training we've had to release
      the new web version before all the features has been moved over, apart from the
      speed timer, the most notable examples are the coach feture, the printable booklets
      and the contact forms, we are working on getting those back as soon as possible,
      but as mentioned above this is volunteer time and we don't have much of it.
    </p>
    <p>
      But not everything that has to be adapted is things you see, we have to adapt the tools
      we use to collect translations, create new tricks and allow judges and officials to verify
      trick levels.
    </p>
    <h3>You can help</h3>
    <p>
      We have a bunch of tricktionary booklets left in stock in our
      <router-link to="/shop">shop</router-link>, unfortunately with only FISAC-IRSF and
      WJRF levels, but if we can get those sold we'll be able to fund a day or two of paid
      work to speed things up, or if you are willing and able please put in a donation,
      it would also help us fund some development time to get those features done (and
      possibly new features)
    </p>
    <div class="center">
      <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WVNM754ZP3DB2">
        <button>
          <font-awesome-icon :icon="['fab', 'paypal']" />&nbsp;Donate
        </button>
      </a>
      <router-link to="/shop" tag="button">
        <font-awesome-icon icon="shopping-cart" />&nbsp;Shop
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Progress from '@/components/Progress.vue'

@Component({
  components: { Progress }
})
export default class v3 extends Vue {}
</script>
