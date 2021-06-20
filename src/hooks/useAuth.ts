import { getAuth, Unsubscribe, User } from '@firebase/auth'
import { ref } from '@vue/reactivity'

const userRef = ref<User | null>()
let off: Unsubscribe

export default function useAuth () {
  if (!off) {
    off = getAuth().onIdTokenChanged(user => {
      userRef.value = user
    })
  }
  return userRef
}
