<template>
  <div class="home">
    <TrickDisciplineSelector
      @input="changeDiscipline($event)"
      :value="$store.state.home.discipline"
    />
    <SocialLinks />

    <Notice
      :markdown="(notice.overrides || {}).web || notice.message"
      v-for="notice in $store.state.globalnotices.notices"
      :key="notice.id"
      :dismissable="true"
    />

    <TrickList
      :tricks="$store.state[`tricks${$store.state.home.discipline}`].tricks"
      :completed="$store.state.checklist.list[$store.state.home.discipline]"
      :discipline="$store.state.home.discipline"
      :loading="isDone($store.state[`tricks${$store.state.home.discipline}`]['_sync'].fetched)"
    />

    <Adsense data-ad-client="ca-pub-7956758256491526" data-ad-slot="1953529861" />
    <div class="center">The content above is an ad served by Google</div>

    <v3 />

    <h2 id="about">About the Tricktionary</h2>
    <p>
      The sport of competitive jump roping is a continually growing international
      community of some of the world's most talented athletes. This app aims to help
      anyone hoping to become involved in this phenomenal sport by giving anyone with
      a phone the power to learn all levels and types of jump rope skills. The
      Tricktionary is organized by type (Basics, Multiples, Power, Rope Manipulation,
      Releases...) and by level. It provides a description, a video,
      prerequisites, and what to learn next for each trick.
    </p>
    <p>
      A new and powerful tool included in The Jump Rope Tricktionary is the speed
      timer. With this tool you can time and click speed and be provided with useful
      statistics about the event. The app displays score, speed, number of misses, an
      estimated score assuming no misses occurred, and a graph of the jumpers
      instantaneous speed throughout the entire event.
    </p>
    <p>
      Also included in the Android&trade; app is the Show Writer. This enables coaches
      and jumpers to quickly write jump rope shows in which each athlete has the
      maximum amount of break time between each of their routines.
    </p>
    <p>
      The tricktionary is currently available as an
      <a
        href="https://play.google.com/store/apps/details?id=trictionary.jumproper.com.jumpropetrictionary"
        target="_blank"
      >Android&trade; app</a>
      and as this webapp, an iOS&reg; app is comming soon.
      If you want to help build the tricktionary, please email
      <a
        href="mailto:develop@the-tricktionary.com"
        target="_blank"
      >develop@the-tricktionary.com</a>
    </p>
    <p>
      As a few last words, if you believe this service is something that we should
      continue working on, please feel free to share the Tricktionary with friends!
      Or consider a small donation to help us pay the administrative costs. Check
      out our shop for products that helps us pay the bills too.
    </p>

    <SocialLinks />

    <RopeScoreAd />

    <h2 id="booklets">the Tricktionary booklet</h2>
    <p>
      the Tricktionary is avilable as a printable booklet. The booklet contains all
      tricks listed on the site as well as four speed protocols. We strongly reccomend
      printing double sided, else you'll have to manually glue the sides together.
    </p>
    <p class="notify">
      Don't want to print yourself? Not able to get through all those pages with your stapler?
      Buy booklets printed on high quality paper from our
      <router-link to="shop">shop</router-link>.
    </p>
    <!-- <booklets /> -->
    <h3 id="rafiki">The Rafiki Outreach Program</h3>
    <p>
      the Tricktionary is a proud supporter of the Rafiki Outreach Program, read more
      about it
      <router-link to="/about/rafiki">here</router-link>.
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { IState } from 'vuex-easy-firestore/types/module/state'
import TrickList from '@/components/TrickList.vue' // @ is an alias to /src
import TrickDisciplineSelector from '@/components/TrickDisciplineSelector.vue'
import SocialLinks from '@/components/SocialLinks.vue'
import Notice from '@/components/Notice.vue'
import v3 from '@/components/v3.vue'
import RopeScoreAd from '@/components/RopeScoreAd.vue'

@Component({
  components: {
    TrickList,
    TrickDisciplineSelector,
    SocialLinks,
    Notice,
    v3,
    RopeScoreAd
  }
})
export default class Home extends Vue {
  mounted () {
    this.fetchDiscipline()

    this.$store.dispatch('globalnotices/openDBChannel')
  }

  fetchDiscipline () {
    this.$store.dispatch(
      `tricks${this.$store.state.home.discipline}/fetchAndAdd`,
      {
        where: [['level', '>=', 0]]
      }
    )
  }

  changeDiscipline (discipline: string) {
    this.$store.commit('home/setDiscipline', { value: discipline })
    this.fetchDiscipline()
  }

  isDone (obj: IState['_sync']['fetched']) {
    return Object.keys(obj)
      .map(key => obj[key].done)
      .reduce((a, b) => (!a ? b : a), false)
  }
}
</script>
