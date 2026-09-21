import { useSetGroupMemberTrickCompletionMutation } from '../graphql/generated/graphql'

import type { ApolloCache, Reference } from '@apollo/client/core'
import type { Ref } from 'vue'
import type { SetGroupMemberTrickCompletionMutation } from '../graphql/generated/graphql'

type Completion = NonNullable<SetGroupMemberTrickCompletionMutation['setGroupMemberTrickCompletion']>

interface Athlete {
  id: string
  /** The account behind the row, when the athlete has claimed it */
  userId?: string | null
}

function patchChecklist (cache: ApolloCache<unknown>, id: string | undefined, trickId: string, added: Completion | null) {
  if (id == null) return
  cache.modify({
    id,
    fields: {
      checklist (existing, { readField, toReference }) {
        const completions: readonly Reference[] = Array.isArray(existing) ? existing : []
        // an untick answers with null, so the row to drop is found by its trick
        const without = completions.filter(ref => readField<string>('id', readField<Reference>('trick', ref)) !== trickId)
        if (!added) return without
        const reference = toReference(added)
        return reference ? [...without, reference] : without
      },
      // dropped so whoever shows them asks again
      checklistStats (_existing, { DELETE }) {
        return DELETE
      }
    }
  })
}

function optimisticCompletion (memberId: string, trickId: string, recordedBy: { id: string, name: string } | null) {
  return {
    setGroupMemberTrickCompletion: {
      __typename: 'TrickCompletion',
      id: `optimistic:${memberId}:${trickId}`,
      trick: { __typename: 'Trick', id: trickId },
      recordedBy: recordedBy ? { __typename: 'User', ...recordedBy } : null
    }
  } as SetGroupMemberTrickCompletionMutation
}

/** `recordedBy` is the admin doing the ticking, which the API stamps on every completion */
export default function useGroupMemberCompletion (recordedBy: Ref<{ id: string, name: string } | null>) {
  const mutation = useSetGroupMemberTrickCompletionMutation({})

  async function toggle (athlete: Athlete, trickId: string, completed: boolean) {
    return await mutation.mutate({ memberId: athlete.id, trickId, completed }, {
      optimisticResponse: completed
        ? optimisticCompletion(athlete.id, trickId, recordedBy.value)
        : { setGroupMemberTrickCompletion: null },
      update (cache, { data }) {
        const added = data?.setGroupMemberTrickCompletion ?? null
        patchChecklist(cache, cache.identify({ __typename: 'GroupMember', id: athlete.id }), trickId, added)
        // the same completions are the athlete's own once they have an account,
        // so their profile would otherwise disagree for the rest of the session
        if (athlete.userId != null) {
          patchChecklist(cache, cache.identify({ __typename: 'User', id: athlete.userId }), trickId, added)
        }
      }
    })
  }

  return { toggle, onError: mutation.onError }
}
