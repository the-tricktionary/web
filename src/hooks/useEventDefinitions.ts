import { computed } from 'vue'

import { useEventDefinitionsQuery } from '../graphql/generated/graphql'
import useSpeedFormat from './useSpeedFormat'

import type { EventDefinitionsQuery } from '../graphql/generated/graphql'

export type EventDefinition = EventDefinitionsQuery['eventDefinitions'][number]

/**
 * The competition events a score can be recorded against, and the same list
 * grouped by duration for a picker. Apollo serves every caller from one
 * cached query, so views are free to call this alongside an EventPicker.
 */
export default function useEventDefinitions () {
  const { duration } = useSpeedFormat()
  const query = useEventDefinitionsQuery({ fetchPolicy: 'cache-and-network' })

  const eventDefinitions = computed(() => query.result.value?.eventDefinitions ?? [])

  const eventGroups = computed(() => {
    const groups = new Map<number, EventDefinition[]>()
    for (const eventDefinition of eventDefinitions.value) {
      const group = groups.get(eventDefinition.totalDuration) ?? []
      group.push(eventDefinition)
      groups.set(eventDefinition.totalDuration, group)
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a - b)
      .map(([totalDuration, defs]) => ({
        label: duration(totalDuration),
        eventDefinitions: [...defs].sort((a, b) => a.name.localeCompare(b.name))
      }))
  })

  return { eventDefinitions, eventGroups, loading: query.loading }
}
