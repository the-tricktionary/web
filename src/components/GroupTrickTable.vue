<template>
  <div class="flex flex-col gap-2">
    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ error }}
    </p>

    <!-- relative keeps the hidden labels from widening the page, isolate keeps the sticky cells under the bars -->
    <div v-if="levels.length" class="relative isolate full-bleed overflow-auto max-h-[70dvh] border border-line rounded">
      <table class="border-collapse">
        <caption class="sr-only">
          {{ t('groups.tricks.caption') }}
        </caption>
        <thead>
          <!-- a fixed height without vertical padding, so the totals row knows where to stick -->
          <tr>
            <th scope="col" class="sticky top-0 left-0 z-20 bg-surface text-left h-11 px-2 py-0 min-w-40">
              {{ t('groups.tricks.trick') }}
            </th>
            <th
              v-for="athlete of athletes"
              :key="athlete.id"
              scope="col"
              class="sticky top-0 z-10 bg-surface h-11 px-2 py-0 touch-target"
            >
              <span class="block max-w-30 truncate">{{ athlete.name }}</span>
            </th>
          </tr>
          <tr>
            <th scope="row" class="sticky top-11 left-0 z-20 bg-surface border-b border-line text-left p-2 min-w-40">
              {{ t('groups.tricks.total', { total: number(tricks.length) }) }}
            </th>
            <td
              v-for="athlete of athletes"
              :key="athlete.id"
              class="sticky top-11 z-10 bg-surface border-b border-line p-2 text-center tabular-nums"
            >
              {{ number(totals.get(athlete.id) ?? 0) }}
            </td>
          </tr>
        </thead>
        <tbody v-for="group of levels" :key="group.level">
          <tr>
            <th scope="rowgroup" class="sticky left-0 z-10 bg-sunken border-b border-line text-left p-2 min-w-40">
              {{ t('groups.tricks.levelTotal', { level: group.label, total: number(group.total) }) }}
            </th>
            <td
              v-for="athlete of athletes"
              :key="athlete.id"
              class="bg-sunken border-b border-line p-2 text-center tabular-nums"
            >
              {{ number(group.completed.get(athlete.id) ?? 0) }}
            </td>
          </tr>
          <tr v-for="trick of group.tricks" :key="trick.id">
            <th scope="row" class="sticky left-0 z-10 bg-surface border-b border-line text-left font-normal p-2 min-w-40 max-w-[55vw] md:max-w-80 whitespace-normal">
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
import useSpeedFormat from '../hooks/useSpeedFormat'

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
const { number } = useSpeedFormat()

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

/** How many of these tricks each athlete has completed, by athlete id */
function completedPerAthlete (tricks: ReadonlyArray<{ id: string }>) {
  return new Map(props.athletes.map(athlete => [
    athlete.id,
    tricks.filter(trick => ticked.value.has(`${athlete.id}:${trick.id}`)).length
  ]))
}

// only this discipline's tricks, as the athletes' checklists span every discipline
const totals = computed(() => completedPerAthlete(props.tricks))

const levels = computed(() => {
  const byLevel = new Map<string, Array<{ id: string, to: string, name: string, nameLang: string }>>()
  for (const trick of [...props.tricks].sort(trickSorter(lang.value))) {
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
      // the counts describe the athletes, so they include the rows hidden below
      total: tricks.length,
      completed: completedPerAthlete(tricks),
      tricks: props.hideCompleted ? tricks.filter(trick => !everyoneCompleted(trick.id)) : tricks
    }))
    .filter(group => group.tricks.length)
})

async function toggle (athlete: Athlete, trickId: string, completed: boolean) {
  if (!props.canEdit) return
  error.value = null
  await toggleCompletion({ id: athlete.id, userId: athlete.user?.id }, trickId, completed)
}
</script>
