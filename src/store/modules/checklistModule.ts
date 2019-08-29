export default {
  firestorePath: 'checklist/{userId}',
  firestoreRefType: 'doc', // or 'doc'
  moduleName: 'checklist',
  statePropName: 'list'
  // sync: {
  //   where: [['name', '==', 'Initialized']]
  // }
}
