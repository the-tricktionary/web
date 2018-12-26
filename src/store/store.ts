import Vue from 'vue'
import Vuex from 'vuex'
import createEasyFirestore from 'vuex-easy-firestore'
import firebase from 'firebase/app'

import 'firebase/firestore'
import 'firebase/auth'

import tricksSRModule from '@/store/modules/tricksSRModule'
import productsModule from '@/store/modules/productsModule'
import shopModule from '@/store/modules/shopModule'

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

const tricksSRFirestore = createEasyFirestore(tricksSRModule, { logging: true })
const productsFirestore = createEasyFirestore(productsModule, { logging: true })

Vue.use(Vuex)

const store = new Vuex.Store({
  plugins: [tricksSRFirestore, productsFirestore],
  modules: {
    shop: shopModule
  },
  state: {},
  mutations: {},
  actions: {}
})

store.dispatch('tricksSR/openDBChannel')

export default store
