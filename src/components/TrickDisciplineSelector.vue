<template>
  <div>
    <button
      v-for="discipline in disciplines"
      :key="discipline.value"
      :class="{ selected: value === discipline.value }"
      @click="$emit('input', discipline.value)"
    >{{ discipline.text }}</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

interface DiciplineButton {
  text: string;
  value: string;
}

@Component
export default class TrickDisciplineSelector extends Vue {
  @Prop() value: string;

  disciplines: DiciplineButton[] = [
    { text: 'Single Rope', value: 'SR' },
    { text: 'Double Dutch', value: 'DD' },
    { text: 'Wheel', value: 'WH' }
  ];
}
</script>

<style scoped>
div {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  margin-top: -5px;
}

button {
  border: none;
  border-radius: 0;
  margin-bottom: 0;
  margin-right: 0;
  width: 30%;
  height: 45px;
  border-bottom: 1px solid var(--l-grey);
}

button:hover,
button.selected {
  border-bottom: 1px solid var(--d-red);
  background-color: var(--d-yellow);
  color: white;
}
</style>
