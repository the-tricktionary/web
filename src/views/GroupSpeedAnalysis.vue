<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap gap-4">
      <label class="flex flex-col gap-1 min-w-60">
        <span class="font-semibold">{{ t('groups.speed.event') }}</span>
        <event-picker v-model="eventDefinitionId" :any-label="t('groups.speed.allEvents')" />
      </label>

      <fieldset class="flex flex-col gap-2 border border-line rounded px-2 pb-2 min-w-60 max-w-120 flex-grow">
        <legend class="font-semibold px-1">
          {{ t('groups.speed.analysis.constellations') }}
        </legend>
        <p v-if="!constellations.length" class="text-muted mb-0">
          {{ t('groups.speed.analysis.noConstellations') }}
        </p>
        <div v-else class="flex flex-col gap-2 max-h-60 overflow-y-auto">
          <div v-for="bucket of constellationGroups" :key="bucket.size" class="flex flex-col">
            <p class="text-muted text-sm mb-0">
              {{ t('groups.athletes', bucket.size) }}
            </p>
            <label
              v-for="option of bucket.constellations"
              :key="option.key"
              class="flex items-center gap-2 touch-target cursor-pointer"
            >
              <input v-model="picked" type="checkbox" :value="option.key" class="w-5 h-5">
              <span>{{ t('groups.speed.constellationOption', { names: constellationNames(option.members), count: option.resultCount }) }}</span>
            </label>
          </div>
          <label class="flex items-center gap-2 touch-target cursor-pointer">
            <input v-model="picked" type="checkbox" value="" class="w-5 h-5">
            <span>{{ t('groups.speed.unassigned') }}</span>
          </label>
        </div>
      </fieldset>
    </div>

    <p v-if="error" class="text-ttred-900 mb-0" role="alert">
      {{ t('groups.speed.failed', { error }) }}
    </p>

    <!-- as tall as a chart and its caption, so picking a mode shifts nothing -->
    <div class="min-h-85 flex flex-col justify-center gap-2">
      <div v-if="mode === 'none'" class="text-center px-2">
        <p class="font-semibold">
          {{ t('groups.speed.analysis.hintTitle') }}
        </p>
        <p class="text-muted mb-0">
          {{ t('groups.speed.analysis.hintBody') }}
        </p>
      </div>

      <div v-else-if="loading" class="flex items-center justify-center flex-col" role="status">
        <icon-loading class="animate-spin w-32 h-32" aria-hidden="true" />
        {{ t('groups.speed.loading') }}
      </div>

      <p v-else-if="!chart.points.length" class="text-muted text-center mb-0" role="status">
        {{ t('groups.speed.analysis.empty') }}
      </p>

      <template v-else>
        <speed-progression-chart
          :points="chart.points"
          :series="chart.series"
          :dashed-series="chart.dashedSeries"
          :chart-label="chartLabel"
        />
        <p class="text-muted text-sm mb-0">
          {{ caption }}
        </p>
      </template>
    </div>

    <section v-if="mode === 'sections' && tableRows.length" class="flex flex-col gap-2">
      <h2 class="mb-0">
        {{ t('groups.speed.analysis.tableTitle') }}
      </h2>

      <label v-if="athletes.length > 1" class="flex flex-col gap-1 min-w-60 max-w-120">
        <span class="font-semibold">{{ t('groups.speed.athlete') }}</span>
        <select v-model="athleteId" class="rounded">
          <option value="">
            {{ t('groups.speed.analysis.allAthletes') }}
          </option>
          <option v-for="option of athletes" :key="option.id" :value="option.id">
            {{ option.name }}
          </option>
        </select>
      </label>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-line text-left">
              <th scope="col" class="py-2 pr-2">
                {{ t('speed.progress.date') }}
              </th>
              <th scope="col" class="py-2 pr-2 text-right">
                {{ t('groups.speed.analysis.total') }}
              </th>
              <th scope="col" class="py-2 pr-2 text-right">
                {{ t('speed.details.paceColumn') }}
              </th>
              <template v-if="athlete">
                <th scope="col" class="py-2 pr-2 text-right">
                  {{ t('groups.speed.analysis.sectionSteps') }}
                </th>
                <th scope="col" class="py-2 pr-2 text-right">
                  {{ t('groups.speed.analysis.sectionPace') }}
                </th>
                <th scope="col" class="py-2 text-right">
                  {{ t('groups.speed.analysis.sectionShare') }}
                </th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry of tableRows" :key="entry.id" class="border-b border-line">
              <td class="py-2 pr-2 whitespace-nowrap">
                <router-link :to="{ name: 'speed-details', params: { id: entry.id }, query: { group: groupId } }">
                  {{ dateTime(entry.createdAt) }}
                </router-link>
              </td>
              <td class="py-2 pr-2 text-right tabular-nums">
                {{ number(entry.count) }}
              </td>
              <td class="py-2 pr-2 text-right tabular-nums whitespace-nowrap">
                {{ entry.pace == null ? '–' : t('speed.details.pace', { pace: number(entry.pace, { decimals: 2 }) }) }}
              </td>
              <template v-if="athlete">
                <td class="py-2 pr-2 text-right tabular-nums">
                  {{ entry.section ? number(entry.section.count) : '–' }}
                </td>
                <td class="py-2 pr-2 text-right tabular-nums whitespace-nowrap">
                  {{ entry.section ? t('speed.details.pace', { pace: number(entry.section.stepsPerSecond, { decimals: 2 }) }) : '–' }}
                </td>
                <td class="py-2 text-right tabular-nums">
                  {{ entry.section ? t('groups.speed.analysis.share', { share: number(entry.section.share, { decimals: 0 }) }) : '–' }}
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <group-bottom-bar />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { constellationMemberIds, constellationNames } from '../helpers'
import useAuth from '../hooks/useAuth'
import useEventDefinitions from '../hooks/useEventDefinitions'
import useGroupConstellations from '../hooks/useGroupConstellations'
import useGroupSpeedAnalysis from '../hooks/useGroupSpeedAnalysis'
import useSpeedFormat from '../hooks/useSpeedFormat'

import EventPicker from '../components/EventPicker.vue'
import GroupBottomBar from '../components/GroupBottomBar.vue'
import SpeedProgressionChart from '../components/SpeedProgressionChart.vue'
import IconLoading from '~icons/mdi/loading'

import type { ProgressionPoint } from '../components/SpeedProgressionChart.vue'
import type { AnalysisResult, SpeedSelection } from '../hooks/useGroupSpeedAnalysis'

const { t } = useI18n()
const route = useRoute()
const { dateTime, number } = useSpeedFormat()
const { firebaseUser } = useAuth()
const { eventDefinitions } = useEventDefinitions()

const groupId = computed(() => typeof route.params.id === 'string' ? route.params.id : '')

const eventDefinitionId = ref('')
/** The keys of the ticked constellations, an empty string for the unassigned scores */
const picked = ref<string[]>([])
const athleteId = ref('')

const { constellations, constellationGroups } = useGroupConstellations(groupId)

const eventName = computed(() => eventDefinitions.value.find(eventDefinition => eventDefinition.id === eventDefinitionId.value)?.name ?? '')

const selections = computed<SpeedSelection[]>(() => {
  if (picked.value.length) {
    return picked.value.map(key => ({ eventDefinitionId: eventDefinitionId.value, constellation: constellationMemberIds(key) }))
  }
  if (eventDefinitionId.value) return [{ eventDefinitionId: eventDefinitionId.value, constellation: null }]
  return []
})

const { selectionResults, loading, error, reload } = useGroupSpeedAnalysis(groupId, selections)

// the first request may leave before the session is restored
watch(() => firebaseUser.value?.uid, () => { reload() })

type Mode = 'none' | 'event' | 'constellations' | 'sections' | 'compare'

const mode = computed<Mode>(() => {
  if (!eventDefinitionId.value && !picked.value.length) return 'none'
  if (!eventDefinitionId.value) return 'constellations'
  if (!picked.value.length) return 'event'
  return picked.value.length === 1 ? 'sections' : 'compare'
})

function constellationLabel (key: string) {
  if (key === '') return t('groups.speed.unassigned')
  const found = constellations.value.find(option => option.key === key)
  return found ? constellationNames(found.members) : key
}

function resultConstellation (result: AnalysisResult) {
  return result.participants.length
    ? constellationNames(result.participants.map(participant => participant.member))
    : t('groups.speed.unassigned')
}

/** The athletes of the one picked constellation, named as the group names them */
const athletes = computed(() => {
  if (mode.value !== 'sections') return []
  const key = picked.value[0] ?? ''
  const found = constellations.value.find(option => option.key === key)
  return (found?.members ?? []).toSorted((a, b) => a.name.localeCompare(b.name))
})

const athlete = computed(() => athletes.value.find(member => member.id === athleteId.value) ?? null)

watch(picked, () => { athleteId.value = '' })

function sectionOf (result: AnalysisResult, memberId: string) {
  const participant = result.participants.find(entry => entry.member.id === memberId)
  if (participant?.segmentIndex == null) return null
  return result.segments.find(segment => segment.index === participant.segmentIndex) ?? null
}

/** The lines the chart draws, ordered so the busiest ones take the first colours */
function ordered (labels: Map<string, number>) {
  return [...labels.entries()]
    .sort(([labelA, countA], [labelB, countB]) => countB - countA || labelA.localeCompare(labelB))
    .map(([label]) => label)
}

const chart = computed<{ points: ProgressionPoint[], series: string[], dashedSeries: string[] }>(() => {
  const points: ProgressionPoint[] = []
  const counts = new Map<string, number>()
  const addSeries = (label: string) => counts.set(label, (counts.get(label) ?? 0) + 1)

  if (mode.value === 'sections') {
    const results = selectionResults.value[0]?.results ?? []
    const totalLabel = t('groups.speed.analysis.total')
    for (const result of results) {
      points.push({
        id: result.id,
        date: new Date(result.createdAt),
        count: result.count,
        name: result.name ?? result.eventDefinition.name,
        series: totalLabel
      })
      addSeries(totalLabel)
      if (athletes.value.length < 2) continue
      for (const member of athletes.value) {
        const segment = sectionOf(result, member.id)
        if (!segment) continue
        points.push({
          id: `${result.id}-${member.id}`,
          date: new Date(result.createdAt),
          count: segment.count,
          name: segment.label ?? t('groups.speed.analysis.sectionN', { n: segment.index + 1 }),
          series: member.name
        })
        addSeries(member.name)
      }
    }
    const dashedSeries = athletes.value.map(member => member.name).filter(name => counts.has(name))
    return { points, series: [totalLabel, ...dashedSeries], dashedSeries }
  }

  for (const { selection, results } of selectionResults.value) {
    const key = selection.constellation ? selection.constellation.join('|') : null
    for (const result of results) {
      const label = mode.value === 'event'
        ? resultConstellation(result)
        : mode.value === 'compare'
          ? constellationLabel(key ?? '')
          : picked.value.length > 1
            ? t('groups.speed.analysis.eventConstellation', { event: result.eventDefinition.name, names: constellationLabel(key ?? '') })
            : result.eventDefinition.name
      points.push({
        id: `${result.id}-${key ?? '*'}`,
        date: new Date(result.createdAt),
        count: result.count,
        name: result.name ?? result.eventDefinition.name,
        series: label
      })
      addSeries(label)
    }
  }

  return { points, series: ordered(counts), dashedSeries: [] }
})

const chartLabel = computed(() => {
  switch (mode.value) {
    case 'constellations':
      return t('groups.speed.analysis.chartConstellations')
    case 'sections':
      return t('groups.speed.analysis.chartSections', { names: constellationLabel(picked.value[0] ?? ''), event: eventName.value })
    default:
      return t('groups.speed.chart', { event: eventName.value })
  }
})

const caption = computed(() => {
  switch (mode.value) {
    case 'constellations':
      return t('groups.speed.analysis.constellationsCaption')
    case 'sections':
      return athletes.value.length > 1
        ? t('groups.speed.analysis.sectionsCaption')
        : t('groups.speed.caption')
    default:
      return t('groups.speed.caption')
  }
})

const tableRows = computed(() => {
  if (mode.value !== 'sections') return []
  const results = (selectionResults.value[0]?.results ?? []).toSorted((a, b) => b.createdAt - a.createdAt)
  return results.map(result => {
    const duration = result.eventDefinition.totalDuration
    const segment = athlete.value ? sectionOf(result, athlete.value.id) : null
    return {
      id: result.id,
      createdAt: result.createdAt,
      count: result.count,
      pace: result.analysis?.stepsPerSecond ?? (duration > 0 ? result.count / duration : null),
      section: segment
        ? {
            count: segment.count,
            stepsPerSecond: segment.stepsPerSecond,
            share: result.count > 0 ? (segment.count / result.count) * 100 : 0
          }
        : null
    }
  })
})
</script>
