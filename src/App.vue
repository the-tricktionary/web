<template>
  <nav-header />
  <router-view />
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './apollo';
import NavHeader from './components/NavHeader.vue';

provide(DefaultApolloClient, apolloClient)
</script>
