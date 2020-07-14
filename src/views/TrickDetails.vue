<template>
  <div class="trick">
    <!-- TODO: Back-button -->
    <!-- TODO: i18n -->
    <h1>{{ trick.name }}</h1>
    <h2>{{ trick.type }}</h2>
    <h3 v-if="alternativeNames.length > 0">Also known as {{ alternativeNames.join(', ') }}</h3>
    <p>{{ trick.description }}</p>

    <div class="checklist" v-if="$store.state.users.currentUser">
      <button
        class="checkbox"
        :class="{ checked: completedArr.indexOf(trick.id) > -1 }"
        @click="toggleCompleted()"
      >Completed</button>
    </div>

    <div class="video">
      <youtube
        :video-id="videos.youtube"
        :player-vars="playerVars"
        width
        ref="youtube"
        v-if="videos.youtube"
      />
    </div>

    <div class="levels">
      <Trick-level
        federation="ijru"
        :level-data="trick.levels.ijru"
      />
    </div>

    <div class="columns">
      <div
        class="column"
        v-if="($store.getters[`tricks${discipline}/prerequisites`][trick.id] || []).length > 0"
        :class="{ double: ($store.getters[`tricks${discipline}/next`][trick.id] || []).length === 0 }"
      >
        <div class="header">
          <h3>Previous</h3>
        </div>
        <TrickButton
          v-for="prereq in $store.getters[`tricks${discipline}/prerequisites`][trick.id]"
          :key="'prerequisites-' + prereq.id"
          :trick="$store.state[`tricks${discipline}`].tricks[prereq.id]"
          :discipline="discipline"
          :completed="completedArr.indexOf(prereq.id) > -1"
          :class="{ double: ($store.getters[`tricks${discipline}/next`][trick.id] || []).length > 0 }"
        />
      </div>
      <div
        class="column"
        v-if="($store.getters[`tricks${discipline}/next`][trick.id] || []).length > 0"
        :class="{ double: ($store.getters[`tricks${discipline}/prerequisites`][trick.id] || []).length === 0 }"
      >
        <div class="header">
          <h3>Next</h3>
        </div>
        <TrickButton
          v-for="next in $store.getters[`tricks${discipline}/next`][trick.id]"
          :key="'next-' + next"
          :trick="$store.state[`tricks${discipline}`].tricks[next]"
          :discipline="discipline"
          :completed="completedArr.indexOf(next) > -1"
          :class="{ double: ($store.getters[`tricks${discipline}/prerequisites`][trick.id] || []).length > 0 }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { arrayUnion, arrayRemove } from 'vuex-easy-firestore'
import VueYoutube from 'vue-youtube'
import TrickLevel from '@/components/TrickLevel.vue' // @ is an alias to /src
import TrickButton from '@/components/TrickButton.vue' // @ is an alias to /src

Vue.use(VueYoutube)

@Component({
  components: {
    TrickLevel,
    TrickButton
  }
})
export default class TrickDetails extends Vue {
  @Prop({ default: false }) private oldLink: boolean;

  playerVars = {
    autoplay: 1,
    loop: 1,
    playsinline: 1,
    rel: 0,
    enablejsapi: 1
  };

  fetchDiscipline () {
    this.$store.dispatch(
      `tricks${this.$store.state.home.discipline}/fetchAndAdd`,
      {
        where: [['level', '>=', 0]]
      }
    )
  }

  get completedArr (): string[] {
    return this.$store.state.checklist.list[this.discipline] || []
  }

  get discipline (): string {
    if (this.oldLink) {
      return 'SR'
    } else {
      return this.$route.params.discipline.substring(0, 2).toUpperCase()
    }
  }

  get trick (): Trick {
    let filter = (id: string): boolean =>
      this.$store.state[`tricks${this.discipline}`].tricks[id].slug ===
      this.$route.params.slug
    if (this.oldLink) {
      filter = (id: string): boolean =>
        this.$store.state[`tricks${this.discipline}`].tricks[id].oldid ===
          Number(this.$route.params.id1) &&
        this.$store.state[`tricks${this.discipline}`].tricks[id].level ===
          Number(this.$route.params.id0) + 1
    }

    const id: string = Object.keys(
      this.$store.state[`tricks${this.discipline}`].tricks
    ).filter(filter)[0]

    return this.$store.state[`tricks${this.discipline}`].tricks[id] || {}
  }

  get alternativeNames (): string[] {
    return this.trick.alternativeNames || []
  }

  get videos (): VideoIDList {
    return this.trick.videos || { youtube: '' }
  }

  toggleCompleted (
    discipline: string = this.discipline,
    trick: Trick = this.trick
  ): void {
    if (this.completedArr.indexOf(trick.id) > -1) {
      this.$store.dispatch('checklist/patch', {
        [discipline]: arrayRemove(trick.id)
      })
    } else {
      this.$store.dispatch('checklist/patch', {
        [discipline]: arrayUnion(trick.id)
      })
    }
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
      this.$store.dispatch(`tricks${this.discipline}/fetchAndAdd`, {
        where: [['slug', '==', this.$route.params.slug]]
      })
    }
    setTimeout(this.fetchDiscipline, 1000)
  }

  get nextTrick () {
    const keys = Object.keys(this.$store.state.tricksSR.tricks)
    const idx = keys.indexOf(this.trick.id)

    if (idx + 1 === keys.length) return false
    return this.$store.state.tricksSR.tricks[keys[idx + 1]]
  }

  get previousTrick () {
    const keys = Object.keys(this.$store.state.tricksSR.tricks)
    const idx = keys.indexOf(this.trick.id)

    if (idx === 0) return false
    return this.$store.state.tricksSR.tricks[keys[idx - 1]]
  }
}
</script>

<style>
.video,
.video iframe,
.checklist {
  max-width: 600px;
  width: 100%;
  margin: auto;
}
</style>

<style scoped>
h1,
h2 {
  margin-top: 0;
  margin-bottom: 0;
}

.trick {
  text-align: center;
}

.checklist {
  text-align: left;
}

.levels {
  max-width: 600px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: auto;
}

.columns {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 2em;
  align-items: flex-start;
  justify-content: flex-start;
}

.column {
  width: 50%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
}

.column.double {
  width: 100%;
}

.column .header {
  width: 100%;
  text-align: center;
}

.column .header h3 {
  width: 5em;
  position: relative;
  display: inline-block;
}

.column h3:before,
.column h3:after {
  content: " ";
  border-bottom: 2px solid var(--l-grey);
  position: absolute;
  width: 100%;
  max-width: 20vw;
  top: 50%;
}

.column h3:before {
  right: 100%;
}

.column h3:after {
  left: 100%;
}

@media all and (max-width: 815px) {
  .columns {
    flex-direction: column;
  }
  .column {
    width: 100%;
  }
}
</style>
