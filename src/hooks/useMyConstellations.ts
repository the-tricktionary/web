import { ref, shallowRef, watch } from 'vue'

import { apolloClient } from '../apollo'
import { GroupConstellationsDocument } from '../graphql/generated/graphql'
import useMyGroups from './useMyGroups'

import type { GroupConstellationsQuery, GroupConstellationsQueryVariables } from '../graphql/generated/graphql'
import type { Constellation } from './useGroupConstellations'

export interface GroupWithConstellations {
  id: string
  name: string
  constellations: Constellation[]
}

/**
 * Every constellation of every group the signed in user is in, one request per
 * group, for a filter that spans them all.
 */
export default function useMyConstellations () {
  const { groups } = useMyGroups()
  const withConstellations = shallowRef<GroupWithConstellations[]>([])
  const loading = ref(false)

  async function load () {
    const wanted = groups.value
    if (!wanted.length) {
      withConstellations.value = []
      return
    }
    loading.value = true
    try {
      const loaded = await Promise.all(wanted.map(async group => {
        const { data } = await apolloClient.query<GroupConstellationsQuery, GroupConstellationsQueryVariables>({
          query: GroupConstellationsDocument,
          variables: { groupId: group.id }
        })
        return { id: group.id, name: group.name, constellations: data.group?.constellations ?? [] }
      }))
      withConstellations.value = loaded.filter(group => group.constellations.length)
    } catch {
      withConstellations.value = []
    } finally {
      loading.value = false
    }
  }

  watch(() => groups.value.map(group => group.id).join(','), () => { void load() }, { immediate: true })

  return { groups, withConstellations, loading }
}
