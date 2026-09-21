import { computed } from 'vue'

import { useMyGroupsQuery } from '../graphql/generated/graphql'

/**
 * The groups the signed in user is in. Apollo serves every caller from one
 * cached query, so a view is free to call this alongside a GroupPicker.
 */
export default function useMyGroups () {
  const query = useMyGroupsQuery({ fetchPolicy: 'cache-and-network' })

  const groups = computed(() => query.result.value?.me?.groups ?? [])

  return { groups, loading: query.loading }
}
