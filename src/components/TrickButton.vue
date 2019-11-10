<template>
  <router-link
    :to="`/trick/${discipline.toLowerCase()}/${trick.slug}`"
    class="trick"
    :class="{ completed }"
    v-if="trick"
  >
    <span class="icon" v-if="completed">
      <font-awesome-icon :icon="['fas', 'check']" />
    </span>
    {{ trick.name }}
  </router-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TrickButton extends Vue {
  @Prop({ default: 'sr' }) discipline: string;
  @Prop({ default: false }) completed: boolean;
  @Prop({ required: true }) trick: Trick;
}
</script>

<style scoped>
.trick {
  border: 1px solid var(--l-grey);
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
  position: relative;
}

.trick.double {
  width: 24%;
}

.trick:hover {
  background-color: var(--l-grey);
  color: var(--black);
}

.completed {
  border-color: var(--l-green);
}

.icon {
  position: absolute;
  top: 0.3em;
  right: 0.3em;
  color: var(--l-green);
}

@media all and (max-width: 1325px) {
  .trick {
    width: 21%;
  }
  .trick.double {
    width: 32%;
  }
}

@media all and (max-width: 1050px) {
  .trick {
    width: 29%;
  }
  .trick.double {
    width: 47%;
  }
}

@media all and (max-width: 970px) {
  .trick {
    width: 45%;
  }
  .trick.double {
    width: 100%;
  }
}

@media all and (max-width: 815px) {
  .trick {
    width: 100%;
  }
}
</style>
