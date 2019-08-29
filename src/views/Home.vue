<template>
  <div class="home">
    <TrickDisciplineSelector
      @input="changeDiscipline($event)"
      :value="$store.state.home.discipline"
    />
    <SocialLinks />
    <TrickList
      :tricks="$store.state[`tricks${$store.state.home.discipline}`].tricks"
      :completed="$store.state.checklist.list[$store.state.home.discipline]"
      :discipline="$store.state.home.discipline"
    />

    <Adsense data-ad-client="ca-pub-7956758256491526" data-ad-slot="1953529861" />

    <h3 id="about">About the Tricktionary</h3>
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
      and as this webapp, if you know how to develop an iOS&reg; app and want to
      contribute to the Tricktionary, please email us at
      <b>develop (at) the-tricktionary (dot) com</b>
    </p>
    <p>
      As a few last words, if you believe this service is something that we should
      continue working on, please feel free to share the Tricktionary with friends!
      Or consider a small donation to help us pay the administrative costs. Check
      out our shop for products taht helps us pay the bills too.
    </p>
    <div class="text">
      <a target="_blank" rel="noopener" href="http://fb.me/jumpropetricktionary">
        <button>
          <font-awesome-icon :icon="['fab', 'facebook-square']" />&nbsp; Facebook
        </button>
      </a>
      <a target="_blank" rel="noopener" href="http://instagram.com/jumpropetricktionary">
        <button>
          <font-awesome-icon :icon="['fab', 'instagram']" />&nbsp; Instagram
        </button>
      </a>

      <a
        target="_blank"
        rel="noopener"
        href="https://twitter.com/home?status=Check%20out%20The%20Jumprope%20Tricktionary%20-%20it's%20like%20a%20dictionary,%20but%20for%20jumprope%20tricks%3A%0Ahttps%3A//the-tricktionary.com%0A%23jumpropeisasport"
      >
        <button>
          <font-awesome-icon :icon="['fab', 'twitter-square']" />&nbsp;Share on Twitter
        </button>
      </a>
      <a
        target="_blank"
        rel="noopener"
        href="mailto:?&subject=the Jump Rope Tricktionary&body=Hey!%0A%0ACheck%20out%20The%20Jumprope%20Tricktionary%20-%20it's%20like%20a%20dictionary,%20but%20for%20jumprope%20tricks%0Ahttps%3A//the-tricktionary.com"
      >
        <button>
          <font-awesome-icon icon="envelope-square" />&nbsp;Share by Email
        </button>
      </a>
      <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WVNM754ZP3DB2">
        <button>
          <font-awesome-icon :icon="['fab', 'paypal']" />&nbsp;Donate
        </button>
      </a>
      <router-link to="/shop" tag="button">
        <font-awesome-icon icon="shopping-cart" />&nbsp;Shop
      </router-link>
    </div>
    <h3 id="booklets">the Tricktionary booklet</h3>
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
import { Component, Vue } from 'vue-property-decorator';
import TrickList from '@/components/TrickList.vue'; // @ is an alias to /src
import TrickDisciplineSelector from '@/components/TrickDisciplineSelector.vue';
import SocialLinks from '@/components/SocialLinks.vue';

@Component({
  components: {
    TrickList,
    TrickDisciplineSelector,
    SocialLinks
  }
})
export default class Home extends Vue {
  mounted () {
    this.fetchDiscipline()
  }

  fetchDiscipline () {
    this.$store.dispatch(
      `tricks${this.$store.state.home.discipline}/fetchAndAdd`,
      {
        where: [['level', '>=', 0]]
      }
    )
  }

  changeDiscipline (discipline) {
    this.$store.commit('home/setDiscipline', { value: discipline })
    this.fetchDiscipline()
  }
}
</script>
