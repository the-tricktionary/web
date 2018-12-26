export default {
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
