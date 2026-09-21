import { ref, shallowRef, watch } from 'vue'

import { apolloClient } from '../apollo'
import { GroupSpeedAnalysisDocument } from '../graphql/generated/graphql'

import type { Ref } from 'vue'
import type { GroupSpeedAnalysisQuery, GroupSpeedAnalysisQueryVariables } from '../graphql/generated/graphql'

export type AnalysisResult = NonNullable<GroupSpeedAnalysisQuery['group']>['speedResults'][number]

export interface SpeedSelection {
  /** An empty string asks for every event */
  eventDefinitionId: string
  /** The athletes who jumped, empty for the scores nobody is named on, null for every constellation */
  constellation: string[] | null
}

export interface SelectionResults {
  selection: SpeedSelection
  results: AnalysisResult[]
}

const PAGE_SIZE = 50
/** A chart of more than this many scores is not worth the requests it costs */
const MAX_PAGES = 20

export function selectionKey (selection: SpeedSelection) {
  return `${selection.eventDefinitionId}#${selection.constellation?.join('|') ?? '*'}`
}

async function fetchSelection (groupId: string, selection: SpeedSelection) {
  const results: AnalysisResult[] = []
  let startAfter: number | null = null

  for (let page = 0; page < MAX_PAGES; page++) {
    const variables: GroupSpeedAnalysisQueryVariables = {
      groupId,
      limit: PAGE_SIZE,
      startAfter,
      eventDefinitionId: selection.eventDefinitionId === '' ? null : selection.eventDefinitionId,
      constellation: selection.constellation
    }
    // the cache merges every page of a filter into one list, which hides how
    // long the page that came back was, so the analysis pages around it
    const { data } = await apolloClient.query<GroupSpeedAnalysisQuery, GroupSpeedAnalysisQueryVariables>({
      query: GroupSpeedAnalysisDocument,
      variables,
      fetchPolicy: 'no-cache'
    })
    const speedResults = data.group?.speedResults ?? []
    results.push(...speedResults)
    if (speedResults.length < PAGE_SIZE) break
    startAfter = speedResults[speedResults.length - 1].createdAt
  }

  return results
}

/**
 * Every score behind the picked filters, one request chain per selection,
 * paged until a short page comes back so a chart and its table agree.
 */
export default function useGroupSpeedAnalysis (groupId: Ref<string>, selections: Ref<SpeedSelection[]>) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectionResults = shallowRef<SelectionResults[]>([])

  const fetched = new Map<string, AnalysisResult[]>()
  let loadedGroupId = ''
  let generation = 0

  async function load () {
    const mine = ++generation
    if (loadedGroupId !== groupId.value) {
      fetched.clear()
      loadedGroupId = groupId.value
    }
    if (groupId.value === '' || !selections.value.length) {
      selectionResults.value = []
      loading.value = false
      return
    }

    loading.value = true
    try {
      const wanted = selections.value
      const loaded = await Promise.all(wanted.map(async selection => {
        const key = selectionKey(selection)
        const cached = fetched.get(key)
        if (cached) return cached
        const results = await fetchSelection(groupId.value, selection)
        fetched.set(key, results)
        return results
      }))
      if (mine !== generation) return
      selectionResults.value = wanted.map((selection, idx) => ({ selection, results: loaded[idx] ?? [] }))
      error.value = null
    } catch (err) {
      if (mine !== generation) return
      selectionResults.value = []
      error.value = (err as Error).message
    } finally {
      if (mine === generation) loading.value = false
    }
  }

  watch(
    () => [groupId.value, selections.value.map(selectionKey).join(',')].join('/'),
    () => { void load() },
    { immediate: true }
  )

  /** Forgets what was fetched, for when the session that may read it changes */
  function reload () {
    fetched.clear()
    void load()
  }

  return { selectionResults, loading, error, reload }
}
