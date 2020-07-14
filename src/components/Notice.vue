<template>
  <div class="notice" :class="level">
    <a v-if="dismissable" class="close" @click="$emit('close')">
      <font-awesome-icon :icon="['fas', 'times']" />
    </a>
    <div v-html="html" class="notice-content" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { markdown } from 'markdown'

@Component
export default class Notice extends Vue {
  @Prop() private markdown: string;
  @Prop() private plaintext: string;
  @Prop({ default: 'notice' }) private level: string;
  @Prop({ default: false }) private dismissable: boolean;

  get html () {
    if (this.plaintext) return this.plaintext

    return markdown.toHTML(this.markdown)
  }
}
</script>

<style scoped>
.notice {
  max-width: var(--content-max-width);
  border: 1px solid;
  border-color: var(--d-yellow);
  margin: auto;
  padding: 1em;
  position: relative;
  border-radius: 0.3em;
  margin-bottom: 0.3em;
}

.close {
  position: absolute;
  top: 0.3em;
  right: 0.5em;
  cursor: pointer;
}
</style>

<style>
.notice-content p:last-child {
  margin-bottom: 0;
}
</style>
