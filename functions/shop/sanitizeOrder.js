const common = require('../common')

module.exports = (change, context) => {
  let data = change.after.data()
  if (data.sanitized) {
    return false
  } else {
    change.after.ref.firestore
      .runTransaction(transaction => {
        transaction.get(change.after.ref)
          .then(dSnap => {
            let sanitized = common.sanitizeOrder(dSnap.data())
            transaction.set(change.after.ref, sanitized)
          })
      }).then(result => {
        console.log('Transaction success!')
      }).catch(err => {
        console.log('Transaction failure:', err)
      })
  }
}
