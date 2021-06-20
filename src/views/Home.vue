
<template>
  <discipline-selector v-model:discipline="discipline" />
  <div class="container mx-auto p-2">
    <trick-list :discipline="discipline" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import TrickList from '../components/TrickList.vue'
import DisciplineSelector from '../components/DisciplineSelector.vue';

import type { Discipline } from '../graphql/generated/graphql';

const discipline = ref<Discipline>()
</script>
