export default {
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
    setCurrentUser: (state, payload) => {
      state.currentUser = payload.value
    },
    setSignInEmail: (state, payload) => {
      state.signInEmail = payload.value
    },
    setSignInPhoneNumber: (state, payload) => {
      state.signInPhoneNumber = payload.value
      state.signInPhoneNumberFormatted = payload.formatted
    }
  },
  getters: {
    getCurrentUser: state => (state.currentUser ? state.users[state.currentUser] : undefined)
  }
}
