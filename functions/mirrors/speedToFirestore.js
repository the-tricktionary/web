const moment = require('moment')
const admin = require('firebase-admin')

exports.create = (snap, context) => {
  let data = snap.val()
  if (data._fromFS) return snap.ref.update({ _fromFS: null })

  data.uid = context.params.uid
  data.created = moment(context.params.created, 'X').toDate()

  data.duration = data.time
  delete data.time

  console.log(data.uid, data.created)

  data._fromRTD = true
  if (typeof data._fromFS !== 'undefined') delete data._fromFS

  return admin.firestore().collection('speed').add(data)
}

exports.update = (change, context) => {
  let before = change.before.val()
  let after = change.after.val()
  after.uid = context.params.uid
  after.created = moment(context.params.created, 'X').toDate()

  after.duration = after.time
  delete after.time

  if (before._fromFS === after._fromFS || before == null) {
    // data not changed by function, update
    console.log(admin.firestore.Timestamp.fromDate(moment(context.params.created, 'X').toDate()))

    if (after._fromFS) change.after.ref.update({ _fromFS: null })
    after._fromRTD = true
    if (typeof after._fromFS !== 'undefined') delete after._fromFS

    return admin.firestore().collection('speed')
      .where('uid', '==', context.params.uid)
      .where('created', '==', admin.firestore.Timestamp.fromDate(moment(context.params.created, 'X').toDate()))
      .get()
      .then(qSnap => {
        return qSnap.forEach(dSnap => {
          dSnap.ref.set(after, { merge: true })
        })
      })
  }

  if (!before._fromFS && after._fromFS) {
    // data just changed by function. Remove flag
    return change.after.ref.update({
      _fromFS: null
    })
  }

  return 'no change needed'
}

exports.delete = (snap, context) => {
  return admin.firestore().collection('speed')
    .where('uid', '==', context.params.uid)
    .where('created', '==', admin.firestore.Timestamp.fromDate(moment(context.params.created, 'X').toDate()))
    .get()
    .then(qSnap => {
      return qSnap.forEach(dSnap => dSnap.ref.delete())
    })
}
