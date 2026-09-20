import { getAnalytics, logEvent } from '@firebase/analytics'
import { getAuth } from '@firebase/auth'
import type { Reference } from '@apollo/client/core'
import { useCompleteTrickMutation } from '../graphql/generated/graphql'

const analytics = getAnalytics()

export default function useCompleteTrick (variables?: { trickId: string, completed: boolean }) {
  const mutation = useCompleteTrickMutation(() => ({
    ...(variables ? { variables } : {}),
    update (cache, { data }) {
      // the API keys users by their Firebase uid
      const userId = getAuth().currentUser?.uid
      if (userId == null) return

      const added = data?.createTrickCompletion
      const removed = data?.deleteTrickCompletion

      cache.modify({
        id: cache.identify({ __typename: 'User', id: userId }),
        fields: {
          checklist (existing, { readField, toReference }) {
            const completions: readonly Reference[] = Array.isArray(existing) ? existing : []
            if (removed) return completions.filter(ref => readField<string>('id', ref) !== removed.id)
            if (!added) return completions
            if (completions.some(ref => readField<string>('id', ref) === added.id)) return completions
            const reference = toReference({ __typename: 'TrickCompletion', id: added.id })
            return reference ? [...completions, reference] : completions
          },
          // dropped so the profile refetches them
          checklistStats (_existing, { DELETE }) {
            return DELETE
          }
        }
      })
    }
  }))

  mutation.onDone(({ data }) => {
    if (data?.createTrickCompletion) {
      logEvent(analytics, 'unlock_achievement', {
        achievement_id: `Trick:${data.createTrickCompletion.trick.id}`
      })
    }
  })

  return mutation
}
