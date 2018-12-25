<template>
  <span v-if="trickLevel" :class="{full: fed === 'IJRU'}">
    {{ fed }} level
    <span class="big">
      {{ trickLevel }}
      <span class="tooltip">
        <font-awesome-icon
          icon="check"
          v-if="trickVerified >= 0"
          :class="{official: trickVerified === 1}"
          class="small"
        />
        <span
          class="tooltiptext"
        >Verified by {{ trickVerified ? 'an ofiicial' : 'a judge' }} from {{ fed }}</span>
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TrickLevel extends Vue {
  @Prop() private federation!: string;
  @Prop() private levelData!: FederationTrickLevel;

  get lev () {
    return this.levelData || {}
  }

  get trickLevel (): string {
    return this.lev.level
  }

  get trickVerified (): number {
    return (this.lev.verified || { verified: false }).verified
      ? (this.lev.verified || { vLevel: 0 }).vLevel
      : -1
  }

  get fed (): string {
    let fed = this.federation.toLocaleLowerCase()

    if (fed === 'ijru') {
      return 'IJRU';
    } else if (fed === 'irsf') {
      return 'FISAC-IRSF';
    } else if (fed === 'wjr') {
      return 'WJRF';
    } else {
      return '';
    }
  }
}
</script>

<style scoped>
.full {
  width: 100%;
}

.big {
  font-weight: bold;
  color: initial;
}

.full .big {
  font-size: 4em;
  display: block;
}

.half {
  color: var(--m-grey);
}

.official {
  color: var(--d-yellow);
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  font-size: initial;
  font-weight: initial;

  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;

  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>
