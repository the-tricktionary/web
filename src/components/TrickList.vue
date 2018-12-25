<template>
  <div class="tricks">
    <!-- Searchbar here -->
    <div class="box loading" v-if="!tricks">
      <span>
        <i class="fa fa-spinner fa-spin fa-4x fa-fw"></i>
        <br>Loading tricks
      </span>
    </div>
    <div v-if="tricks">
      <div v-for="level in structure" :key="level.name" class="box">
        <h2>Level {{ level.name }}</h2>
        <div v-for="type in level.types" :key="type.name" class="box">
          <h3>{{ type.name }}</h3>
          <router-link
            :to="`/trick/${trickType}/${trick.slug}`"
            class="parent"
            v-for="trick in type.tricks"
            :key="trick.id"
          >{{ trick.name }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TrickList extends Vue {
  @Prop() private tricks!: ListOfTricks;
  @Prop({ default: 'sr' }) private trickType!: string;

  get structure (): Level[] {
    let trickIDs: string[] = Object.keys(this.tricks)
    let tricks: Trick[] = trickIDs.map((id: string): Trick => this.tricks[id])
    let struct: Level[] = []

    while (tricks.length > 0) {
      let first: Trick = tricks[0]
      let filtered: Trick[] = tricks.filter(
        (trick: Trick): boolean => trick.level === first.level
      )
      tricks = tricks.filter(
        (trick: Trick): boolean => trick.level !== first.level
      )

      let types: Type[] = filtered
        .map((trick: Trick): string => trick.type)
        .filter(
          (value: string, index: number, self: string[]): boolean => {
            return self.indexOf(value) === index
          }
        )
        .sort((a: string, b: string): number => a.localeCompare(b))
        .map(
          (type: string): Type => ({
            name: type,
            tricks: filtered.filter(
              (trick: Trick): boolean => trick.type === type
            )
          })
        )

      let level: Level = {
        name: first.level,
        types
      }

      struct.push(level)
    }

    console.log(struct)

    return struct.sort(
      (a: Level, b: Level): number => (a.name > b.name ? 1 : -1)
    )
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
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

.box {
  text-align: center;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: stretch;
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

.parent {
  background-color: var(--rl-gray);
  border-radius: 5px;
  padding: 1em;
  text-align: center;
  margin-bottom: 0.5em;
  margin-right: 0.25em;
  margin-left: 0.25em;
  width: 19%;
  text-decoration: none;
  color: var(--black);
  cursor: pointer;
  cursor: hand;
}

.parent:hover,
.hover:hover {
  background-color: var(--l-gray);
  color: var(--black);
}

@media all and (max-width: 1325px) {
  .parent {
    width: 21%;
  }
}

@media all and (max-width: 1050px) {
  .parent {
    width: 29%;
  }
}

@media all and (max-width: 970px) {
  .parent {
    width: 45%;
  }
}

@media all and (max-width: 815px) {
  .parent {
    width: 100%;
  }
}

@media all and (max-width: 800px) {
  .video {
    width: 100%;
    height: 54vw;
  }
}
</style>
