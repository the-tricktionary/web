const admin = require('firebase-admin')
const firestore = admin.firestore()
const common = require('./common')

module.exports = (change, context) => {
  let data = change.after.val()
  let obj = {}
  return change.after.ref.parent.child('en').once('value', snapshot => {
    let english = snapshot.val()
    for (let i = 0; i < english.length; i++) {
      obj[common.typeRenewer(english[i])] = data[i]
    }
    console.log(obj)
    return firestore.collection('i18n').doc(context.params.lang)
      .collection('tricktypes').doc('translated')
      .set(obj, { merge: true })
  })
}
