<template>
  <div class="pb-container">
    <div class="pb-bar" :style="{ '--percentage': percentage }">
      <div class="pb-text">{{ percentage }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class Progress extends Vue {
  @Prop({ default: 0 }) progress: number;

  get percentage (): string {
    return `${Math.round(this.progress * 100)}%`
  }
}
</script>

<style scoped>
.pb-container {
  position: relative;
  width: 100%;
  max-width: var(--content-max-width);
  height: 30px;
  margin-top: 0.5em;
  border: 1px solid var(--l-grey);
  border-radius: 0.3em;
  margin: auto;
}

.pb-bar {
  background-color: var(--l-green);
  height: 100%;
  border-radius: 0.3em;
  width: var(--percentage);
  transition: width 0.5s;
}

.pb-text {
  text-align: center;
  color: white;
  padding-top: 0.15em;
  height: 100%;
}
</style>
