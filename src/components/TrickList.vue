<template>
  <div class="tricks">
    <div class="list-controls">
      <VueFuse
        :keys="searchKeys"
        :list="$store.state.home.hideCompleted ? tricksArrayNoCompleted : tricksArray"
        event-name="results"
        input-change-event-name="input"
        placeholder="Search Tricks"
        :default-all="true"
        :case-sensitive="false"
        class="searchbox"
        :value="$store.state.home.searchQuery"
        @input="$store.commit('home/setSearchQuery', { value: $event })"
      />
      <label>
        <button
          class="checkbox"
          :class="{ checked: $store.state.home.hideCompleted }"
          @click="$store.commit('home/toggleHideCompleted')"
        >{{ $store.state.home.hideCompleted ? 'Show' : 'Hide' }} Completed</button>
      </label>
      <select>
        <option>English</option>
        <option>Svenska</option>
      </select>
    </div>
    <div class="box loading" v-if="Object.keys(tricks || {}).length < 1">
      <span>
        <font-awesome-icon icon="spinner" spin size="6x" />
        <br />Loading tricks
      </span>
    </div>
    <div v-if="tricks">
      <div v-for="level in structure" :key="level.name" class="box">
        <h2>Level {{ level.name }}</h2>
        <div v-for="type in level.types" :key="type.name" class="box">
          <h3>{{ type.name }}</h3>
          <TrickButton
            v-for="trick in type.tricks"
            :key="trick.id"
            :trick="trick"
            :completed="completed.indexOf(trick.id) > -1"
            :discipline="discipline"
          />
        </div>
      </div>
      <div v-if="!loading && Object.keys(structure).length === 0" class="blank">
        <h3>No Tricks matching your filters</h3>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import VueFuse from "vue-fuse";
import TrickButton from "@/components/TrickButton.vue";

@Component({
  components: {
    VueFuse,
    TrickButton
  }
})
export default class TrickList extends Vue {
  @Prop() private tricks!: ListOfTricks;
  @Prop({ default: () => [] }) private completed: string[];
  @Prop({ default: "sr" }) private discipline!: string;
  @Prop() private loading: boolean;

  tricksFiltered: Trick[] = [];
  searchKeys: string[] = ["name", "type", "description"];

  created() {
    this.$on("results", (tricksFiltered: Trick[]) => {
      this.tricksFiltered = tricksFiltered;
    });
  }

  get tricksArray() {
    let trickIDs: string[] = Object.keys(this.tricks);
    let tricks: Trick[] = trickIDs.map((id: string): Trick => this.tricks[id]);
    return tricks;
  }

  get tricksArrayNoCompleted() {
    let tricksArray = this.tricksArray;
    let filtered = tricksArray.filter(
      el => this.completed.indexOf(el.id) === -1
    );
    return filtered;
  }

  get structure(): Level[] {
    let tricks = this.tricksFiltered;
    let struct: Level[] = [];

    while (tricks.length > 0) {
      let first: Trick = tricks[0];
      let filtered: Trick[] = tricks.filter(
        (trick: Trick): boolean => trick.level === first.level
      );
      tricks = tricks.filter(
        (trick: Trick): boolean => trick.level !== first.level
      );

      let types: Type[] = filtered
        .map((trick: Trick): string => trick.type)
        .filter((value: string, index: number, self: string[]): boolean => {
          return self.indexOf(value) === index;
        })
        .sort((a: string, b: string): number => a.localeCompare(b))
        .map(
          (type: string): Type => ({
            name: type,
            tricks: filtered
              .filter((trick: Trick): boolean => trick.type === type)
              .sort((a, b) => a.name.localeCompare(b.name)) // TODO: i18n
          })
        );

      let level: Level = {
        name: first.level,
        types
      };

      struct.push(level);
    }

    return struct.sort((a: Level, b: Level): number =>
      a.name > b.name ? 1 : -1
    );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h2 {
  margin-bottom: 0;
  font-size: 2em;
  width: 5em;
  text-align: center;
  position: relative;
}

h2:before,
h2:after {
  content: " ";
  border-bottom: 2px solid var(--l-grey);
  position: absolute;
  width: 100%;
  max-width: 20vw;
  top: 50%;
}

h2:before {
  right: 100%;
}

h2:after {
  left: 100%;
}

h3 {
  margin: 40px 0 0;
  color: var(--d-grey);
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.list-controls,
.box {
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: stretch;
}

.list-controls {
  width: 90%;
  max-width: 40em;
  margin: auto;
  justify-content: space-between;
  margin-top: 1em;
}

.list-controls label,
.list-controls select {
  width: 40%;
  max-width: 15em;
  margin: 0;
  margin-top: 1em;
  padding: 0;
}

.list-controls select {
  padding: 0.5em;
}

.list-controls button {
  width: 100%;
  margin: 0;
}

.box {
  width: 100%;
  justify-content: space-around;
}

.box h3 {
  width: 100%;
  color: var(--black);
  font-weight: lighter;
  font-size: 1.5em;
  margin: 1em 0 0;
  padding: 0;
  text-align: center;
}

.box h3:first-child {
  margin-top: 0;
}
</style>
