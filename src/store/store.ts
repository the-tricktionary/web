import Vue from 'vue'
import Vuex, { Mutation, StoreOptions, Store } from 'vuex'
import createEasyFirestore from 'vuex-easy-firestore'
import createMutationsSharer from 'vuex-shared-mutations'
import VuexPersistence from 'vuex-persist'
import firebase from 'firebase/app'
// import * as Sentry from '@sentry/browser'

import 'firebase/firestore'
import 'firebase/auth'

import tricksSRModule from '@/store/modules/tricksSRModule'
import tricksDDModule from '@/store/modules/tricksDDModule'
import tricksWHModule from '@/store/modules/tricksWHModule'
import productsModule from '@/store/modules/productsModule'
import checklistModule from '@/store/modules/checklistModule'
import usersModule from '@/store/modules/usersModule'
import globalnoticesModule from '@/store/modules/globalnoticesModule'

import shopModule from '@/store/modules/shopModule'
import homeModule from '@/store/modules/homeModule'

var config = {
  apiKey: 'AIzaSyD07mROu__kGOuJ-0MyjtjS6R5-DiTfUpM',
  authDomain: 'the-tricktionary.com',
  databaseURL: 'https://project-5641153190345267944.firebaseio.com',
  projectId: 'project-5641153190345267944',
  storageBucket: 'project-5641153190345267944.appspot.com',
  messagingSenderId: '1048157266079',
  appId: '1:1048157266079:web:a8ae83f6f16d7436'
}
firebase.initializeApp(config)

const firestoreModules = createEasyFirestore([tricksSRModule, tricksDDModule, tricksWHModule, checklistModule, usersModule, productsModule, globalnoticesModule], { logging: true })
const mutationsSharer = createMutationsSharer({
  predicate: ['users/setSignInEmail', 'users/currentUser']
})

const VuexLocal = new VuexPersistence({
  storage: window.localStorage,
  key: 'tricktionary-state',
  modules: ['home']
})

Vue.use(Vuex)

export interface RootState { }

const store: Store<RootState> = new Vuex.Store(<StoreOptions<RootState>>{
  plugins: [VuexLocal.plugin, mutationsSharer, firestoreModules],
  modules: {
    shop: shopModule,
    home: homeModule
  },
  state: {},
  mutations: {},
  actions: {
  }
})

store.dispatch('tricksSR/openDBChannel')
store.dispatch('tricksDD/openDBChannel')
store.dispatch('tricksWH/openDBChannel')

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    store.dispatch('checklist/openDBChannel')
    store.dispatch('users/fetchById', user.uid)
    store.commit('users/setCurrentUser', { value: user.uid })
    // Sentry.configureScope(scope => {
    //   scope.setUser({ id: user.uid })
    // })
  } else {
    store.dispatch('checklist/closeDBChannel', { clearModule: true })
    store.commit('users/setCurrentUser', { value: '' })
    // Sentry.configureScope(scope => {
    //   scope.clear()
    // })
  }
})

export default store
