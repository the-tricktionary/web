<template>
  <div class="w-full border-b border-line flex justify-center overflow-x-auto" role="group" :aria-label="t('home.discipline')">
    <button
      v-for="dOpt in disciplines"
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
      {{ t(enumKey('discipline', dOpt)) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { Discipline } from '../graphql/generated/graphql'
import { enumKey } from '../helpers'

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

const { t } = useI18n()
const discipline = toRef(props, 'discipline')

const disciplines = [Discipline.SingleRope, Discipline.DoubleDutch, Discipline.Wheel]
</script>
