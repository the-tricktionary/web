import { Module } from 'vuex'
import { RootState } from '../store'

interface HomeState {
  discipline: string
  hideCompleted: boolean
  searchQuery: string
}

const homeModule: Module<HomeState, RootState> = {
  namespaced: true,
  state: {
    discipline: 'SR',
    hideCompleted: false,
    searchQuery: ''
  },
  mutations: {
    setDiscipline: (state, payload) => { state.discipline = payload.value },
    toggleHideCompleted: state => { state.hideCompleted = !state.hideCompleted },
    setSearchQuery: (state, payload) => { state.searchQuery = payload.value }
  }
}

export default homeModule
