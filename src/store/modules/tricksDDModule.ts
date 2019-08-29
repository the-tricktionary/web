import { prerequisites, next } from './tricksSRModule'

export default {
  firestorePath: 'tricksDD',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'tricksDD',
  statePropName: 'tricks',
  sync: {
    where: [['name', '==', 'Initialized']]
  },
  fetch: {
    // The max amount of documents to be fetched. Defaults to 50.
    docLimit: 5000
  },
  // you can also add state/getters/mutations/actions
  // for other config like fillables see 'Extra features'

  getters: {
    prerequisites,
    next
  }
}
