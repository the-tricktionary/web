<template>
  <div
    class="grid"
    :class="{ 'border-success': completed, 'grid-cols-[3rem_auto]': enableChecklist }"
  >
    <label
      v-if="enableChecklist"
      class="cursor-pointer flex rounded-l h-full border border-r-0 border-line hover:bg-elevated items-center justify-center focus-within:outline-2 focus-within:outline-solid focus-within:outline-ttred-900 focus-within:outline-offset-2"
      :class="{
        'bg-success': completed,
        'border-success': completed,
        'hover:bg-success-soft': completed,
        'bg-success-soft': loading
      }"
    >
      <icon-loading v-if="loading" class="text-white animate-spin" aria-hidden="true" />
      <icon-check v-else class="text-white" aria-hidden="true" />
      <input
        type="checkbox"
        class="sr-only"
        :checked="completed"
        :disabled="!enableChecklist || loading"
        :aria-busy="loading"
        @change="completeTrick(($event.target as HTMLInputElement).checked)"
      >
      <span class="sr-only">{{ t('trick.completedTrick', { name: localised.name }) }}</span>
    </label>
    <router-link
      class="flex rounded-r border border-line p-2 items-center justify-center text-center hover:bg-elevated"
      :class="{
        'border-success': completed,
        'rounded-l': !enableChecklist,
        'pr-[3rem]': enableChecklist
      }"
      :to="`/trick/${discipline}/${trick.slug}`"
      :lang="localised.nameLang === lang ? undefined : localised.nameLang"
      @click="$emit('navigate')"
    >
      {{ localised.name }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { disciplineToSlug, localiseTrick } from '../helpers'

import IconCheck from '~icons/mdi/check'
import IconLoading from '~icons/mdi/loading'

import type { PropType } from 'vue'
import type { TricksQuery } from '../graphql/generated/graphql'
import useCompleteTrick from '../hooks/useCompleteTrick'
import useLanguage from '../hooks/useLanguage'

const props = defineProps({
  trick: {
    type: Object as PropType<TricksQuery['tricks'][number]>,
    required: true
  },
  completed: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  enableChecklist: {
    type: Boolean,
    default: false
  }
})

defineEmits<{
  navigate: []
}>()

const { t } = useI18n()
const trick = toRef(props, 'trick')
const completed = toRef(props, 'completed')

const { lang } = useLanguage()
const localised = computed(() => localiseTrick(trick.value, lang.value))

const discipline = ref(disciplineToSlug(trick.value.discipline))

const { mutate: completeTrickMutate, loading } = useCompleteTrick()

async function completeTrick (completed?: boolean) {
  if (!trick.value) return
  if (typeof completed !== 'boolean') return
  await completeTrickMutate({
    trickId: trick.value.id,
    completed
  })
}
</script>
