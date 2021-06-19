<template>
  <nav-header></nav-header>
  <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './apollo';
import NavHeader from './components/NavHeader.vue';

export default defineComponent({
    name: "App",
    setup () {
      provide(DefaultApolloClient, apolloClient)
    },
    components: { NavHeader }
})
</script>
