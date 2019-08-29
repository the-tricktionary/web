const homeModule = {
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
