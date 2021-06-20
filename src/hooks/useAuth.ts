import { getAnalytics, setUserId } from '@firebase/analytics'
import { getAuth, Unsubscribe, User } from '@firebase/auth'
import { setUser } from '@sentry/minimal'
import { ref } from '@vue/reactivity'

const analytics = getAnalytics()
const userRef = ref<User | null>()
let off: Unsubscribe

export default function useAuth () {
  if (!off) {
    off = getAuth().onIdTokenChanged(user => {
      userRef.value = user
      setUserId(analytics, user?.uid ?? '')
      setUser(user
        ? {
          id: user.uid,
          ...(user.email ? { email: user.email } : {})
        }
        : null
      )
    })
  }
  return userRef
}
