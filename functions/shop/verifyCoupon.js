const functions = require('firebase-functions')
const admin = require('firebase-admin')

module.exports = (data, context) => {
  console.log(data.code)
  return admin.firestore().collection('shopSettings').doc('coupons').get().then(dSnap => {
    let doc = dSnap.data()

    if (doc[data.code]) {
      return { valid: true }
    } else {
      return { valid: false }
    }
  })
}
