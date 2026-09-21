import type { ApolloCache, Reference } from '@apollo/client/core'
import type { GroupBaseFragment, GroupInviteBaseFragment } from '../graphql/generated/graphql'

function refList (existing: unknown): readonly Reference[] {
  return Array.isArray(existing) ? existing as readonly Reference[] : []
}

export function addGroupToCache (cache: ApolloCache<unknown>, userId: string, group: GroupBaseFragment) {
  const userRef = cache.identify({ __typename: 'User', id: userId })
  if (!userRef) return
  cache.modify({
    id: userRef,
    fields: {
      groups (existing, { toReference }) {
        const list = refList(existing)
        const ref = toReference(group)
        if (!ref || list.some(entry => entry.__ref === ref.__ref)) return list
        return [ref, ...list]
      }
    }
  })
}

export function addGroupInviteToCache (cache: ApolloCache<unknown>, userId: string, invite: GroupInviteBaseFragment) {
  const userRef = cache.identify({ __typename: 'User', id: userId })
  if (!userRef) return
  cache.modify({
    id: userRef,
    fields: {
      groupInvites (existing, { toReference }) {
        const list = refList(existing)
        const ref = toReference(invite)
        if (!ref || list.some(entry => entry.__ref === ref.__ref)) return list
        return [ref, ...list]
      }
    }
  })
}

export function removeGroupInviteFromCache (cache: ApolloCache<unknown>, userId: string, inviteId: string) {
  const userRef = cache.identify({ __typename: 'User', id: userId })
  if (!userRef) return
  cache.modify({
    id: userRef,
    fields: {
      // answered server side rather than deleted, so it leaves the list but
      // stays in the cache for the mutation's own result to reference
      groupInvites (existing, { readField }) {
        return refList(existing).filter(ref => readField<string>('id', ref) !== inviteId)
      }
    }
  })
}
