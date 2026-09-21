import type { ApolloCache, Reference } from '@apollo/client/core'
import type { SpeedResultBaseFragment } from '../graphql/generated/graphql'

/**
 * Cache helpers so the list of results reflects a create or delete straight
 * away, without waiting for the list query to refetch.
 */

export function addSpeedResultToCache (cache: ApolloCache<unknown>, userId: string, speedResult: SpeedResultBaseFragment) {
  // your own list is what you competed in plus what you entered and have not assigned
  const competed = speedResult.participants.some(participant => participant.member.user?.id === userId)
  if (speedResult.group && speedResult.participants.length > 0 && !competed) return

  const userRef = cache.identify({ __typename: 'User', id: userId })
  if (!userRef) return
  cache.modify({
    id: userRef,
    fields: {
      speedResults (existing, { toReference, storeFieldName }) {
        const list: readonly Reference[] = Array.isArray(existing) ? existing as readonly Reference[] : []
        // a listing filtered to another event or another group does not get this result
        const filteredEvent = /"eventDefinitionId":"([^"]+)"/.exec(storeFieldName)?.[1]
        if (filteredEvent && filteredEvent !== speedResult.eventDefinition.id) return list
        const filteredGroup = /"groupId":"([^"]+)"/.exec(storeFieldName)?.[1]
        if (filteredGroup && filteredGroup !== speedResult.group?.id) return list
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
