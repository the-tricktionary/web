
<template>
  <div v-if="loading">Loading...</div>
  <template v-else-if="tricks" v-for="(trickTypes, level) of tricks" :key="`tt-${level}`">
    <h2 class="trick-level mx-auto w-32 px-4 mt-6 text-3xl font-bold relative text-center">Level {{ level }}</h2>
    <template v-for="(tricks, trickType) of trickTypes" :key="`tt-${level}-${trickType}`">
      <template v-if="tricks.length">
        <h3 class="mx-auto text-center px-4 text-2xl mt-4">{{ trickType }}</h3>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          <trick-box  :trick="trick" v-for="trick of tricks" :key="trick.id" />
        </div>
      </template>
    </template>
  </template>
  <div v-else>No tricks with the specified criteria</div>
</template>

<script lang="ts">
import { useResult } from '@vue/apollo-composable'
import { defineComponent, PropType, ref, watch } from 'vue'
import { Discipline, TricksQuery, TrickType, useTricksQuery } from '../graphql/generated/graphql'

import TrickBox from './TrickBox.vue'

export default defineComponent({
  name: 'TrickList',
  components: {
    TrickBox
  },
  props: {
    discipline: {
      type: String as PropType<Discipline>,
      default: Discipline.SingleRope
    }
  },
  setup (props) {
    const { result, loading, variables } = useTricksQuery({ discipline: props.discipline, withLocalised: false })

    watch(props, () => {
      variables.value.discipline = props.discipline
    })

    const tricks = useResult(result, null, data => {
      const tricks: { [level: string]: Record<TrickType, Array<TricksQuery['tricks'][number]>> } = {}
      for (const trick of data.tricks) {
        const level = trick.levels[0]?.level
        const trickType = trick.trickType
        if (!tricks[level]) tricks[level] = Object.fromEntries(Object.values(TrickType).sort((a, b) => a.localeCompare(b)).map(type => [type, []])) as unknown as Record<TrickType, Array<TricksQuery['tricks'][number]>>
        tricks[level][trickType].push(trick)
      }
      return tricks
    })

    return {
      tricks,
      loading
    }
  }
})
</script>

<style scoped>
.trick-level:before,
.trick-level:after {
  content: " ";
  @apply border-b-2;
  @apply border-gray-300;
  @apply absolute;
  width: 100%;
  max-width: 20vw;
  top: 50%;
}

.trick-level:before {
  right: 100%;
}

.trick-level:after {
  left: 100%;
}

.trick-level+h3 {
  @apply mt-0;
}
</style>
