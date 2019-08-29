<template>
  <div>
    <div v-if="uid">Logged in</div>
    <Auth />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Auth from '@/components/Auth.vue';

@Component({
  components: {
    Auth
  }
})
export default class Profile extends Vue {
  get uid () {
    return this.$route.params.uid || this.$store.state.users.currentUser
  }
}
</script>
