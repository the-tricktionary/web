import { provideApolloClient } from '@vue/apollo-composable'
import { computed, effectScope, watch } from 'vue'

import { apolloClient } from '../apollo'
import { GroupInviteKind, GroupInviteStatus, useGroupInvitesQuery } from '../graphql/generated/graphql'
import useAuth from './useAuth'

import type { GroupInviteBaseFragment } from '../graphql/generated/graphql'

// the nav badge lives as long as the app, so the query sits in a detached
// scope rather than in the first component that asked
const scope = effectScope(true)
let state: ReturnType<typeof createState> | undefined

/** Answering is refused once an invitation has expired */
function answerable (invite: GroupInviteBaseFragment) {
  return invite.status === GroupInviteStatus.Pending && invite.expiresAt > Date.now()
}

function createState () {
  provideApolloClient(apolloClient)

  const { firebaseUser } = useAuth()

  const query = useGroupInvitesQuery({ fetchPolicy: 'cache-and-network' })

  // the first request may leave before the session is restored
  watch(() => firebaseUser.value?.uid, () => { void query.refetch() })

  const invites = computed(() => query.result.value?.me?.groupInvites ?? [])

  /** Invitations waiting for an answer from us */
  const pendingInvites = computed(() => invites.value.filter(invite =>
    invite.kind === GroupInviteKind.Invited && answerable(invite)
  ))

  /** Codes we have redeemed, waiting on the group's admins */
  const pendingRequests = computed(() => invites.value.filter(invite =>
    invite.kind === GroupInviteKind.Requested && answerable(invite)
  ))

  const badgeCount = computed(() => pendingInvites.value.length)

  return { invites, pendingInvites, pendingRequests, badgeCount, loading: query.loading }
}

export default function useGroupInvites () {
  state ??= scope.run(createState)!
  return state
}
