const admin = require('firebase-admin')

exports.write = (snap, context) => {
  let enabled = snap.after.val()

  return admin.firestore().collection('tricksSR').where('oldid', '==', Number(context.params.trick)).where('level', '==', Number(context.params.level) + 1).get()
    .then(qSnap => {
      if (qSnap.empty) {
        console.log('No matching documents.')
        return
      }

      qSnap.forEach(dSnap => {
        console.log(dSnap.id, '=>', dSnap.data())
        if (enabled) {
          return admin.firestore().collection('checklist').doc(context.params.uid).set({
            SR: admin.firestore.FieldValue.arrayUnion(dSnap.id)
          }, { merge: true })
        } else {
          return admin.firestore().collection('checklist').doc(context.params.uid).set({
            SR: admin.firestore.FieldValue.arrayRemove(dSnap.id)
          }, { merge: true })
        }
      })
    })
    .catch(err => {
      console.log('Error getting documents', err)
    })
}

// exports.update = (change, context) => {
//   let before = change.before.val()
//   let after = change.after.val()
//   after.uid = context.params.uid
//   after.created = moment(context.params.created, 'X').toDate()

//   after.duration = after.time
//   delete after.time

//   if (before._fromFS === after._fromFS || before == null) {
//     // data not changed by function, update
//     console.log(admin.firestore.Timestamp.fromDate(moment(context.params.created, 'X').toDate()))

//     if (after._fromFS) change.after.ref.update({ _fromFS: null })
//     after._fromRTD = true
//     if (typeof after._fromFS !== 'undefined') delete after._fromFS

//     return admin.firestore().collection('speed')
//       .where('uid', '==', context.params.uid)
//       .where('created', '==', admin.firestore.Timestamp.fromDate(moment(context.params.created, 'X').toDate()))
//       .get()
//       .then(qSnap => {
//         return qSnap.forEach(dSnap => {
//           dSnap.ref.set(after, { merge: true })
//         })
//       })
//   }

//   if (!before._fromFS && after._fromFS) {
//     // data just changed by function. Remove flag
//     return change.after.ref.update({
//       _fromFS: null
//     })
//   }

//   return 'no change needed'
// }

// exports.delete = (snap, context) => {
//   return admin.firestore().collection('speed')
//     .where('uid', '==', context.params.uid)
//     .where('created', '==', admin.firestore.Timestamp.fromDate(moment(context.params.created, 'X').toDate()))
//     .get()
//     .then(qSnap => {
//       return qSnap.forEach(dSnap => dSnap.ref.delete())
//     })
// }
