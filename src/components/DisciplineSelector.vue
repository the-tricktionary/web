<template>
  <div class="w-full border-b border-line flex justify-center overflow-x-auto" role="group" aria-label="Discipline">
    <button
      v-for="(name, dOpt) in disciplines"
      :key="dOpt"
      type="button"
      :aria-pressed="discipline === dOpt"
      :class="{
        'border-ttred-900': discipline === dOpt,
        'border-b-2': discipline === dOpt,
        'mb-0': discipline === dOpt,
        'mb-2px': discipline !== dOpt
      }"
      class="hover:bg-elevated hover:border-ttred-900 hover:border-b-2 hover:mb-0 py-2 px-8 whitespace-nowrap"
      @click="$emit('update:discipline', dOpt)"
    >
      {{ name }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import { Discipline } from '../graphql/generated/graphql'

import type { PropType } from 'vue'

const props = defineProps({
  discipline: {
    type: String as PropType<Discipline>,
    default: Discipline.SingleRope
  }
})

defineEmits<{
  'update:discipline': [discipline: Discipline]
}>()

const discipline = toRef(props, 'discipline')

const disciplines = ref({
  [Discipline.SingleRope]: 'Single Rope',
  [Discipline.DoubleDutch]: 'Double Dutch',
  [Discipline.Wheel]: 'Wheel'
})
</script>
