const moment = require('moment')
const admin = require('firebase-admin')

exports.create = (dSnap, context) => {
  let data = dSnap.data()
  if (data._fromRTD) return dSnap.ref.update({ _fromRTD: admin.firestore.FieldValue.delete() })

  let uid = data.uid
  let created = moment(data.created).format('X')

  delete data.uid
  delete data.created

  data.time = data.duration
  delete data.duration

  data._fromFS = true
  if (typeof data._fromRTD !== 'undefined') delete data._fromRTD

  return admin.database().ref('/speed/scores').child(uid).child(created).add(data)
}

exports.update = (change, context) => {
  let before = change.before.data()
  let after = change.after.data()
  let uid = after.uid
  let created = moment(after.created).format('X')

  delete after.uid
  delete after.created

  after.time = after.duration
  delete after.duration

  if (before._fromRTD === after._fromRTD) {
    // data not changed by function, update
    if (after._fromRTD) change.after.ref.update({ _fromRTD: admin.firestore.FieldValue.delete() })
    after._fromFS = true
    if (typeof after._fromRTD !== 'undefined') delete after._fromRTD

    return admin.database().ref('/speed/scores').child(uid).child(created).set(after)
  }

  if (!before._fromRTD && after._fromRTD) {
    // data just changed by function. Remove flag
    return change.after.ref.update({
      _fromRTD: admin.firestore.FieldValue.delete()
    })
  }

  return 'no change needed'
}

exports.delete = (dSnap, context) => {
  let data = dSnap.data()
  let uid = data.uid
  let created = moment(data.created).format('X')

  return admin.database().ref('/speed/scores').child(uid).child(created).remove()
}
