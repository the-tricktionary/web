<template>
  <router-link
    class="flex flex-col rounded border border-line bg-surface hover:bg-elevated p-2 gap-1"
    :to="{ name: 'group-tricks', params: { id: group.id } }"
  >
    <span class="font-bold truncate">{{ group.name }}</span>
    <span class="text-muted text-sm truncate">
      {{ athletes === 1 ? t('groups.athlete') : t('groups.athletes', { count: athletes }) }}
      <template v-if="isAdmin"> &middot; {{ t('groups.youAreAdmin') }}</template>
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { GroupRole } from '../graphql/generated/graphql'

import type { PropType } from 'vue'
import type { GroupBaseFragment } from '../graphql/generated/graphql'

const props = defineProps({
  group: {
    type: Object as PropType<GroupBaseFragment>,
    required: true
  }
})

const { t } = useI18n()

const athletes = computed(() => props.group.members.filter(member => !member.observer).length)
const isAdmin = computed(() => props.group.myMembership?.role === GroupRole.Admin)
</script>
