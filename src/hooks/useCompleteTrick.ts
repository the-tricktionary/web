import { getAnalytics, logEvent } from '@firebase/analytics'
import { MeDocument, MeQuery, MeQueryVariables, useCompleteTrickMutation } from '../graphql/generated/graphql'

import type { Ref } from 'vue'

const analytics = getAnalytics()

export default function useCompleteTrick (variables?: { trickId: string, completed: boolean }) {
  const mutation = useCompleteTrickMutation(() => ({
    ...(variables ? { variables } : {}),
    update (cache, { data }) {
      const cachedData = cache.readQuery<MeQuery, MeQueryVariables>({ query: MeDocument, variables: { withChecklist: true } })

      if (cachedData?.me?.checklist?.length) {
        const checklist = [...cachedData.me.checklist]
        if (data?.deleteTrickCompletion) {
          const cachedIdx = cachedData.me.checklist.findIndex(tc => tc.id === data.deleteTrickCompletion?.id)
          checklist.splice(cachedIdx, 1)
        }
        if (data?.createTrickCompletion?.id) {
          checklist.push(data.createTrickCompletion)
        }

        cache.writeQuery<Partial<MeQuery> | null, MeQueryVariables>({
          query: MeDocument,
          variables: { withChecklist: true },
          data: { me: { id: cachedData?.me?.id, checklist } }
        })
      }
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
