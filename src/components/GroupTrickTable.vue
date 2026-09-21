<template>
  <div class="flex flex-col gap-2">
    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <!-- relative so the visually hidden labels inside the cells do not widen the page -->
    <div v-if="levels.length" class="relative overflow-auto max-h-[70dvh] border border-line rounded">
      <table class="border-collapse">
        <caption class="sr-only">
          {{ t('groups.tricks.caption') }}
        </caption>
        <thead>
          <tr>
            <th scope="col" class="sticky top-0 left-0 z-20 bg-surface border-b border-line text-left p-2 min-w-40">
              {{ t('groups.tricks.trick') }}
            </th>
            <th
              v-for="athlete of athletes"
              :key="athlete.id"
              scope="col"
              class="sticky top-0 z-10 bg-surface border-b border-line p-2 touch-target"
            >
              <span class="block max-w-30 truncate">{{ athlete.name }}</span>
            </th>
          </tr>
        </thead>
        <tbody v-for="group of levels" :key="group.level">
          <tr>
            <th :colspan="athletes.length + 1" scope="colgroup" class="bg-sunken border-b border-line text-left p-2">
              <span class="sticky left-2 inline-block">{{ group.label }}</span>
            </th>
          </tr>
          <tr v-for="trick of group.tricks" :key="trick.id">
            <th scope="row" class="sticky left-0 z-10 bg-surface border-b border-line text-left font-normal p-2 min-w-40">
              <router-link :to="trick.to" :lang="trick.nameLang === lang ? undefined : trick.nameLang">
                {{ trick.name }}
              </router-link>
            </th>
            <td v-for="athlete of athletes" :key="athlete.id" class="border-b border-line p-0">
              <label
                class="flex touch-target w-full h-full items-center justify-center focus-within:outline-2 focus-within:outline-solid focus-within:outline-ttred-900 focus-within:outline-offset-[-2px]"
                :class="canEdit ? 'cursor-pointer hover:bg-elevated' : 'cursor-default'"
              >
                <input
                  type="checkbox"
                  class="sr-only"
                  :checked="ticked.has(`${athlete.id}:${trick.id}`)"
                  :disabled="!canEdit"
                  @change="toggle(athlete, trick.id, ($event.target as HTMLInputElement).checked)"
                >
                <span class="sr-only">{{ t('groups.tricks.completedBy', { athlete: athlete.name, trick: trick.name }) }}</span>
                <icon-check v-if="ticked.has(`${athlete.id}:${trick.id}`)" class="text-success" aria-hidden="true" />
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-muted mb-0">
      {{ t('groups.tricks.allCompleted') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { disciplineToSlug, localiseTrick, trickSorter } from '../helpers'
import useGroupMemberCompletion from '../hooks/useGroupMemberCompletion'
import useLanguage from '../hooks/useLanguage'

import IconCheck from '~icons/mdi/check'

import type { PropType } from 'vue'
import type { GroupChecklistsQuery } from '../graphql/generated/graphql'

type Athlete = NonNullable<GroupChecklistsQuery['group']>['members'][number]
type Completion = Athlete['checklist'][number]

const props = defineProps({
  tricks: {
    type: Array as PropType<GroupChecklistsQuery['tricks']>,
    required: true
  },
  athletes: {
    type: Array as PropType<Athlete[]>,
    required: true
  },
  canEdit: Boolean,
  hideCompleted: Boolean
})

const { t } = useI18n()
const { lang } = useLanguage()

const error = ref<string | null>(null)

const { toggle: toggleCompletion, onError } = useGroupMemberCompletion()

onError(err => { error.value = t('groups.tricks.failed', { error: err.message }) })

const ticked = computed(() => {
  const map = new Map<string, Completion>()
  for (const athlete of props.athletes) {
    for (const completion of athlete.checklist) map.set(`${athlete.id}:${completion.trick.id}`, completion)
  }
  return map
})

function everyoneCompleted (trickId: string) {
  return props.athletes.every(athlete => ticked.value.has(`${athlete.id}:${trickId}`))
}

const levels = computed(() => {
  const byLevel = new Map<string, Array<{ id: string, to: string, name: string, nameLang: string }>>()
  for (const trick of [...props.tricks].sort(trickSorter(lang.value))) {
    if (props.hideCompleted && everyoneCompleted(trick.id)) continue
    const level = trick.ttLevels[0]?.level ?? ''
    const localised = localiseTrick(trick, lang.value)
    const rows = byLevel.get(level) ?? []
    rows.push({
      id: trick.id,
      to: `/trick/${disciplineToSlug(trick.discipline)}/${trick.slug}`,
      name: localised.name || trick.slug,
      nameLang: localised.nameLang
    })
    byLevel.set(level, rows)
  }
  return [...byLevel.entries()]
    .toSorted(([a], [b]) => {
      // tricks the Tricktionary has given no level sort last
      if (a === '' || b === '') return a === b ? 0 : (a === '' ? 1 : -1)
      return a.localeCompare(b, undefined, { numeric: true })
    })
    .map(([level, tricks]) => ({
      level,
      label: level ? t('home.level', { level }) : t('trick.levels.noLevel'),
      tricks
    }))
})

async function toggle (athlete: Athlete, trickId: string, completed: boolean) {
  if (!props.canEdit) return
  error.value = null
  await toggleCompletion({ id: athlete.id, userId: athlete.user?.id }, trickId, completed)
}
</script>
