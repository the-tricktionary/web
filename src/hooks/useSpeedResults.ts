import type { ApolloCache, Reference } from '@apollo/client/core'
import type { SpeedResultBaseFragment } from '../graphql/generated/graphql'

/**
 * Cache helpers so the list of results reflects a create or delete straight
 * away, without waiting for the list query to refetch.
 */

export function addSpeedResultToCache (cache: ApolloCache<unknown>, userId: string, speedResult: SpeedResultBaseFragment) {
  const userRef = cache.identify({ __typename: 'User', id: userId })
  if (!userRef) return
  cache.modify({
    id: userRef,
    fields: {
      speedResults (existing, { toReference }) {
        const list: readonly Reference[] = Array.isArray(existing) ? existing as readonly Reference[] : []
        const ref = toReference(speedResult)
        if (!ref || list.some(e => e.__ref === ref.__ref)) return list
        return [ref, ...list]
      }
    }
  })
}

export function removeSpeedResultFromCache (cache: ApolloCache<unknown>, speedResultId: string) {
  const ref = cache.identify({ __typename: 'SpeedResult', id: speedResultId })
  if (!ref) return
  cache.evict({ id: ref })
  cache.gc()
}
