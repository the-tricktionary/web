<template>
  <div class="trick">
    <h1>{{ trick.name }}</h1>
    <h2>{{ trick.type }}</h2>
    <h3 v-if="alternativeNames.length > 0">Also known as {{ alternativeNames.join(', ') }}</h3>
    <p>{{ trick.description }}</p>
    <div class="video">
      <youtube :video-id="trick.videos.youtube" :player-vars="playerVars" ref="youtube"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import VueYoutube from 'vue-youtube';

Vue.use(VueYoutube)

@Component
export default class TrickDetails extends Vue {
  @Prop({ default: false }) private oldLink: boolean;

  playerVars = {
    autoplay: 1
  };

  get tricktype (): string {
    if (this.oldLink) {
      return 'SR';
    } else {
      return this.$route.params.type.substring(0, 2).toLocaleUpperCase()
    }
  }

  get trick (): Trick {
    let filter = (id: string): boolean =>
      this.$store.state[`tricks${this.tricktype}`].docs[id].slug ===
      this.$route.params.slug
    if (this.oldLink) {
      filter = (id: string): boolean =>
        this.$store.state[`tricks${this.tricktype}`].docs[id].oldid ===
          Number(this.$route.params.id1) &&
        this.$store.state[`tricks${this.tricktype}`].docs[id].level ===
          Number(this.$route.params.id0) + 1
    }

    let id: string = Object.keys(
      this.$store.state[`tricks${this.tricktype}`].docs
    ).filter(filter)[0]

    return this.$store.state[`tricks${this.tricktype}`].docs[id] || {}
  }

  get alternativeNames (): string[] {
    return this.trick.alternativeNames || []
  }

  mounted (): void {
    if (this.oldLink) {
      this.$store.dispatch('tricksSR/fetchAndAdd', {
        where: [
          ['level', '==', Number(this.$route.params.id0) + 1],
          ['oldid', '==', Number(this.$route.params.id1)]
        ]
      })
    } else {
      this.$store.dispatch(`tricks${this.tricktype}/fetchAndAdd`, {
        where: [['slug', '==', this.$route.params.slug]]
      })
    }
  }
}
</script>

<style scoped>
.trick {
  text-align: center;
}
</style>
