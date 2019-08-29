import { IEasyFirestoreModule } from 'vuex-easy-firestore/types/declarations'

interface UsersState {
  currentUser: string
  signInEmail: string
  signInPhoneNumber: string
  signInPhoneNumberFormatted: string
  users: any
}

interface UsersPayload {
  value: string
  formatted?: string
}

export default <IEasyFirestoreModule>{
  firestorePath: 'users',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'users',
  statePropName: 'users',

  state: {
    currentUser: '',
    signInEmail: '',
    signInPhoneNumber: '',
    signInPhoneNumberFormatted: ''
  },
  mutations: {
    setCurrentUser: (state: UsersState, payload: UsersPayload) => {
      state.currentUser = payload.value
    },
    setSignInEmail: (state: UsersState, payload: UsersPayload) => {
      state.signInEmail = payload.value
    },
    setSignInPhoneNumber: (state: UsersState, payload: UsersPayload) => {
      state.signInPhoneNumber = payload.value
      state.signInPhoneNumberFormatted = payload.formatted || ''
    }
  },
  getters: {
    getCurrentUser: (state: UsersState) => (state.currentUser ? state.users[state.currentUser] : undefined)
  }
}
