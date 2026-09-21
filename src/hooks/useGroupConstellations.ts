import { computed, watch } from 'vue'

import { useGroupConstellationsQuery } from '../graphql/generated/graphql'
import useAuth from './useAuth'

import type { Ref } from 'vue'
import type { GroupConstellationsQuery } from '../graphql/generated/graphql'

export type Constellation = NonNullable<GroupConstellationsQuery['group']>['constellations'][number]

/**
 * The sets of athletes a group has scores for, and the same list in buckets of
 * how many athletes jumped, fewest first, each bucket in the order the group
 * gave them.
 */
export default function useGroupConstellations (groupId: Ref<string>) {
  const { firebaseUser } = useAuth()

  const query = useGroupConstellationsQuery(
    () => ({ groupId: groupId.value }),
    () => ({ enabled: groupId.value !== '', fetchPolicy: 'cache-and-network' })
  )

  // the first request may leave before the session is restored
  watch(() => firebaseUser.value?.uid, () => { void query.refetch() })

  const constellations = computed(() => query.result.value?.group?.constellations ?? [])

  const constellationGroups = computed(() => {
    const bySize = new Map<number, Constellation[]>()
    for (const option of constellations.value) {
      const bucket = bySize.get(option.members.length) ?? []
      bucket.push(option)
      bySize.set(option.members.length, bucket)
    }
    return [...bySize.entries()]
      .toSorted(([a], [b]) => a - b)
      .map(([size, options]) => ({ size, constellations: options }))
  })

  return { constellations, constellationGroups, loading: query.loading }
}
