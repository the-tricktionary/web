<template>
  <router-link
    :to="`/trick/${discipline}/${trick.slug}`"
    class="flex block rounded border border-gray-300 hover:bg-gray-200 p-2 items-center justify-center text-center"
  >
    {{ trick.localised?.name ?? trick.en?.name }}
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "@vue/runtime-core";
import { TricksQuery } from "../graphql/generated/graphql";
import { disciplineToSlug } from "../helpers";

export default defineComponent({
  name: 'TrickBox',
  props: {
    trick: {
      required: true,
      type: Object as PropType<TricksQuery['tricks'][number]>
    }
  },
  setup ({ trick }) {
    return {
      discipline: ref(disciplineToSlug(trick.discipline))
    }
  }
})
</script>
