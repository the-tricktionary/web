const admin = require('firebase-admin')
const firestore = admin.firestore()

module.exports = (change, context) => {
  return firestore.collection('i18n').doc(context.params.lang).set({ name: change.after.val(), enabled: true }, { merge: true })
}
