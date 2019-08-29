import { IEasyFirestoreModule } from 'vuex-easy-firestore/types/declarations'

interface TricksState {
  tricks: {
    [s: string]: Trick
  }
}

interface PrerequisitesObj {
  [s: string]: Prerequisite[]
}

interface NextObj {
  [s: string]: string[]
}

export const prerequisites = (state: TricksState): PrerequisitesObj => {
  let result: PrerequisitesObj = {}

  for (let id in state.tricks) {
    result[id] = state.tricks[id].prerequisites || []
  }

  return result
}

export const next = (state: TricksState): NextObj => {
  let result: NextObj = {}

  for (let id in state.tricks) {
    for (let prereq of state.tricks[id].prerequisites || []) {
      if (!result[prereq.id]) result[prereq.id] = []
      result[prereq.id].push(id)
    }
  }

  return result
}

export default <IEasyFirestoreModule>{
  firestorePath: 'tricksSR',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'tricksSR',
  statePropName: 'tricks',
  sync: {
    where: [['name', '==', 'Initialized']]
  },
  fetch: {
    // The max amount of documents to be fetched. Defaults to 50.
    docLimit: 5000
  },
  // you can also add state/getters/mutations/actions

  getters: {
    prerequisites,
    next
  }
}
