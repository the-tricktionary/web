<template>
  <div v-if="loading" class="flex items-center justify-center flex-col" role="status">
    <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
    {{ t('home.loading') }}
  </div>
  <template v-for="(trickTypes, level) of sorted" v-else-if="numTricks > 0" :key="`tt-${level}`">
    <h2 class="trick-level mx-auto w-32 px-4 mt-6 text-3xl font-bold relative text-center">
      {{ t('home.level', { level }) }}
    </h2>
    <template v-for="(group, trickType) of trickTypes" :key="`tt-${level}-${trickType}`">
      <template v-if="group.length">
        <h3 class="mx-auto text-center px-4 text-2xl mt-4">
          {{ trickTypeLabel(trickType) }}
        </h3>
        <div class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          <trick-box v-for="trick of group" :key="trick.id" :enable-checklist="enableChecklist" :completed="checklist.has(trick.id)" :trick="trick" />
        </div>
      </template>
    </template>
  </template>
  <div v-else class="flex items-center justify-center flex-col" role="status">
    <icon-confused class="w-32 h-32" aria-hidden="true" />
    {{ t('home.noTricks') }}
    <template v-if="submitPrompt">
      <span class="mt-4">{{ t('home.submitPrompt') }}</span>
      <router-link :to="submitTo" class="btn w-max inline-block mt-2">
        {{ t('home.submitCta') }}
      </router-link>
    </template>
  </div>

  <div v-if="submitPrompt && !loading && numTricks > 0" class="flex justify-center mt-8">
    <router-link :to="submitTo" class="btn w-max inline-block">
      {{ t('home.submitAny') }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { TrickType } from '../graphql/generated/graphql'
import { trickSorter, trickTypeOf } from '../helpers'
import useLanguage from '../hooks/useLanguage'
import useTags from '../hooks/useTags'

import IconLoading from '~icons/mdi/loading'
import IconConfused from '~icons/mdi/map-marker-question-outline'
import TrickBox from './TrickBox.vue'

import type { PropType } from 'vue'
import type { Discipline, TricksQuery } from '../graphql/generated/graphql'

const props = defineProps({
  tricks: {
    type: Array as PropType<Readonly<TricksQuery['tricks']> | TricksQuery['tricks']>,
    required: false,
    default: () => []
  },
  checklist: {
    type: Set as PropType<Set<string>>,
    default: new Set()
  },
  loading: {
    type: Boolean,
    default: false
  },
  hideCompleted: {
    type: Boolean,
    default: false
  },
  enableChecklist: {
    type: Boolean,
    default: false
  },
  /** Offers submitting a trick */
  submitPrompt: {
    type: Boolean,
    default: false
  },
  /** Carried to the submit page as its preselected discipline */
  discipline: {
    type: String as PropType<Discipline>,
    default: undefined
  }
})

const { t } = useI18n()
const { lang } = useLanguage()
const { trickTypeLabel } = useTags()

const shown = computed(() => {
  const dataTricks = [...props.tricks ?? []]
  if (props.hideCompleted) return dataTricks.filter(t => !props.checklist.has(t.id))
  return dataTricks
})

const sorted = computed(() => {
  const sorted: Record<string, Record<TrickType, TricksQuery['tricks']>> = {}
  const dataTricks = [...shown.value]
  dataTricks.sort(trickSorter(lang.value))
  for (const trick of dataTricks) {
    const level = trick.ttLevels[0]?.level
    const trickType = trickTypeOf(trick) ?? TrickType.Basic
    if (!sorted[level]) sorted[level] = Object.fromEntries(Object.values(TrickType).sort((a, b) => trickTypeLabel(a).localeCompare(trickTypeLabel(b), lang.value)).map(type => [type, []])) as unknown as Record<TrickType, Array<TricksQuery['tricks'][number]>>
    sorted[level][trickType].push(trick)
  }
  return sorted
})

const numTricks = computed(() => shown.value.length)

const submitTo = computed(() => ({
  name: 'submit-trick',
  ...(props.discipline ? { query: { discipline: props.discipline } } : {})
}))
</script>

<style scoped>
.trick-level:before,
.trick-level:after {
  content: " ";
  @apply border-b-2;
  @apply border-line;
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
