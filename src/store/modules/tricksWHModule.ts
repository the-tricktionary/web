export default {
  firestorePath: 'tricksWH',
  firestoreRefType: 'collection', // or 'doc'
  moduleName: 'tricksWH',
  statePropName: 'tricks',
  sync: {
    where: [['name', '==', 'Initialized']]
  },
  fetch: {
    // The max amount of documents to be fetched. Defaults to 50.
    docLimit: 5000
  }
  // you can also add state/getters/mutations/actions
  // for other config like fillables see 'Extra features'
}
