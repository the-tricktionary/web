import { Module } from 'vuex'
import { RootState } from '../store'

interface HomeState {
  discipline: string
  hideCompleted: boolean
}

const homeModule: Module<HomeState, RootState> = {
  namespaced: true,
  state: {
    discipline: 'SR',
    hideCompleted: false
  },
  mutations: {
    setDiscipline: (state, payload) => { state.discipline = payload.value },
    toggleHideCompleted: state => { state.hideCompleted = !state.hideCompleted }
  }
}

export default homeModule
