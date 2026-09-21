import type { ApolloCache, Reference } from '@apollo/client/core'
import type { GroupBaseFragment, GroupInviteAdminFragment, GroupInviteBaseFragment, GroupMemberBaseFragment } from '../graphql/generated/graphql'

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

export function removeGroupFromCache (cache: ApolloCache<unknown>, userId: string, groupId: string) {
  const userRef = cache.identify({ __typename: 'User', id: userId })
  if (!userRef) return
  cache.modify({
    id: userRef,
    fields: {
      groups (existing, { readField }) {
        return refList(existing).filter(ref => readField<string>('id', ref) !== groupId)
      }
    }
  })
}

export function addMemberToCache (cache: ApolloCache<unknown>, groupId: string, member: GroupMemberBaseFragment) {
  const groupRef = cache.identify({ __typename: 'Group', id: groupId })
  if (!groupRef) return
  cache.modify({
    id: groupRef,
    fields: {
      members (existing, { toReference }) {
        const list = refList(existing)
        const ref = toReference(member)
        if (!ref || list.some(entry => entry.__ref === ref.__ref)) return list
        return [...list, ref]
      }
    }
  })
}

export function removeMemberFromCache (cache: ApolloCache<unknown>, groupId: string, memberId: string) {
  const groupRef = cache.identify({ __typename: 'Group', id: groupId })
  if (!groupRef) return
  cache.modify({
    id: groupRef,
    fields: {
      members (existing, { readField }) {
        return refList(existing).filter(ref => readField<string>('id', ref) !== memberId)
      }
    }
  })
  cache.evict({ id: cache.identify({ __typename: 'GroupMember', id: memberId }) })
  cache.gc()
}

/**
 * Approving a join request answers with the invitation, not with the row it
 * claimed or created, so the list is dropped for the query to fetch again.
 */
export function evictMembersFromCache (cache: ApolloCache<unknown>, groupId: string) {
  cache.evict({ id: cache.identify({ __typename: 'Group', id: groupId }), fieldName: 'members' })
  cache.gc()
}

export function addInviteToGroupCache (cache: ApolloCache<unknown>, groupId: string, invite: GroupInviteAdminFragment) {
  const groupRef = cache.identify({ __typename: 'Group', id: groupId })
  if (!groupRef) return
  cache.modify({
    id: groupRef,
    fields: {
      invites (existing, { toReference }) {
        const list = refList(existing)
        const ref = toReference(invite)
        if (!ref || list.some(entry => entry.__ref === ref.__ref)) return list
        return [ref, ...list]
      }
    }
  })
}

export function removeInviteFromGroupCache (cache: ApolloCache<unknown>, groupId: string, inviteId: string) {
  const groupRef = cache.identify({ __typename: 'Group', id: groupId })
  if (!groupRef) return
  cache.modify({
    id: groupRef,
    fields: {
      invites (existing, { readField }) {
        return refList(existing).filter(ref => readField<string>('id', ref) !== inviteId)
      }
    }
  })
}
