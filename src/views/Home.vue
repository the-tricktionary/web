
<template>
  <discipline-selector v-model:discipline="discipline" />
  <div class="container mx-auto p-2">
    <trick-list :discipline="discipline" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

import TrickList from '../components/TrickList.vue'
import DisciplineSelector from '../components/DisciplineSelector.vue';
import { Discipline } from '../graphql/generated/graphql';

export default defineComponent({
  name: 'Home',
  components: {
    TrickList,
    DisciplineSelector
  },
  setup () {
    return {
      discipline: ref<Discipline>()
    }
  }
})
</script>
