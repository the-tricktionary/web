<template>
  <section>
    <h2 class="mb-2">
      {{ t('profile.completedTricks') }}
    </h2>

    <discipline-selector v-model:discipline="discipline" />

    <trick-list
      v-if="tricks.length"
      :tricks="tricks"
      :checklist="completed"
      :enable-checklist="isMe"
    />
    <p v-else class="text-muted mt-4 mb-0">
      {{ t('profile.noneInDiscipline') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { Discipline } from '../graphql/generated/graphql'

import DisciplineSelector from './DisciplineSelector.vue'
import TrickList from './TrickList.vue'

import type { ProfileUserFragment } from '../graphql/generated/graphql'

type Completion = NonNullable<ProfileUserFragment['checklist']>[number]

const props = defineProps<{
  checklist: readonly Completion[]
  isMe: boolean
}>()

const { t } = useI18n()

const discipline = ref<Discipline>(Discipline.SingleRope)

const tricks = computed(() => props.checklist
  .filter(completion => completion.trick.discipline === discipline.value)
  .map(completion => completion.trick)
)

const completed = computed(() => new Set(props.checklist.map(completion => completion.trick.id)))
</script>
