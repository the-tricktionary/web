import { getAnalytics, setUserId } from '@firebase/analytics'
import { getAuth, Unsubscribe, User } from '@firebase/auth'
import { setUser } from '@sentry/browser'
import { useResult } from '@vue/apollo-composable'
import { ref } from '@vue/reactivity'
import { useMeQuery } from '../graphql/generated/graphql'

const analytics = getAnalytics()
const firebaseUser = ref<User | null>()
let off: Unsubscribe

export default function useAuth ({ withChecklist = false } = {}) {
  const userQuery = useMeQuery({ withChecklist }, { fetchPolicy: 'cache-and-network' })

  const user = useResult(userQuery.result, null, data => data.me)

  if (!off) {
    off = getAuth().onIdTokenChanged(user => {
      // set the ref to get the firebase user
      firebaseUser.value = user
      // refetch the user document from the db
      userQuery.refetch()
      // set the user ID for analytics
      setUserId(analytics, user?.uid ?? '')
      // set the user id for error reporting
      setUser(user ? { id: user.uid } : null)
    })
  }
  return {
    user,
    firebaseUser
  }
}
