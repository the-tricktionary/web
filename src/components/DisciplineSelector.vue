<template>
  <div class="w-full border-b border-gray-300 flex justify-center">
    <button
      v-for="(name, dOpt) in disciplines"
      :key="dOpt"
      :class="{
        'border-ttred-900': discipline === dOpt,
        'border-b-2': discipline === dOpt,
        'mb-0': discipline === dOpt
      }"
      class="hover:bg-gray-200 hover:border-ttred-900 hover:border-b-2 hover:mb-0 mb-2px py-2 px-8"
      @click="$emit('update:discipline', dOpt)"
    >{{ name }}</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "@vue/runtime-core";
import { Discipline } from "../graphql/generated/graphql";

export default defineComponent({
  name: 'DisciplineSelector',
  props: {
    discipline: {
      type: String as PropType<Discipline>,
      default: Discipline.SingleRope
    }
  },
  setup () {
    return {
      disciplines: ref({
        [Discipline.SingleRope]: 'Single Rope',
        [Discipline.DoubleDutch]: 'Double Dutch',
        [Discipline.Wheel]: 'Wheel'
      })
    }
  }
})
</script>
