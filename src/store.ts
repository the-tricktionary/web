import Vue from 'vue'
import Vuex from 'vuex'
import createEasyFirestore from 'vuex-easy-firestore'
import firebase from 'firebase/app'

import 'firebase/firestore'
import 'firebase/auth'

var config = {
  apiKey: 'AIzaSyD07mROu__kGOuJ-0MyjtjS6R5-DiTfUpM',
  authDomain: 'project-5641153190345267944.firebaseapp.com',
  databaseURL: 'https://project-5641153190345267944.firebaseio.com',
  projectId: 'project-5641153190345267944',
  storageBucket: 'project-5641153190345267944.appspot.com',
  messagingSenderId: '1048157266079'
}
firebase.initializeApp(config)
const firestore = firebase.firestore()
const settings = { timestampsInSnapshots: true }
firestore.settings(settings)

const tricksSRModule = {
  firestorePath: 'tricksSR',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'tricksSR',
  statePropName: 'docs',
  sync: {
    where: [['name', '==', 'Initialized']]
  },
  fetch: {
    // The max amount of documents to be fetched. Defaults to 50.
    docLimit: 500
  }
  // you can also add state/getters/mutations/actions
  // for other config like fillables see 'Extra features'
}

const tricksSRFirestore = createEasyFirestore(tricksSRModule, { logging: true })

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [tricksSRFirestore],
  state: {

  },
  mutations: {

  },
  actions: {

  }
})

store.dispatch('tricksSR/openDBChannel')

export default store
