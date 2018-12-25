<template>
  <div class="home">
    <TrickList :tricks="$store.state.tricksSR.docs"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TrickList from '@/components/TrickList.vue'; // @ is an alias to /src

@Component({
  components: {
    TrickList
  }
})
export default class Home extends Vue {
  mounted () {
    this.$store.dispatch('tricksSR/fetchAndAdd', {
      where: [['level', '>=', 0]]
    })
  }
}
</script>
