const admin = require('firebase-admin')
const common = require('../common')

module.exports = (change, context) => {
  const data = change.after.data()

  if (data.sanitized && data.paid && data.receiptSent && !data.stockUpdated && data.livemode) {
    return admin.firestore().collection('products').get().then(qSnap => {
      let products = {}
      let updates = []

      qSnap.forEach(dSnap => {
        products[dSnap.id] = dSnap.data()
      })

      for (let product of data.paidItems) {
        let item = common.findBySku(products, product.sku)

        updates.push({
          ref: admin.firestore().collection('products').doc(item.id),
          qty: product.quantity,
          id: item.id
        })
      }

      return admin.firestore().runTransaction(transaction => {
        let refs = updates.map(update => update.ref)

        return transaction.getAll(...refs).then(qSnap => {
          qSnap.forEach(dSnap => {
            let idx = updates.findIndex(el => el.id === dSnap.id)

            if (idx >= 0) {
              return transaction.update(dSnap.ref, {
                qty: dSnap.data().qty - updates[idx].qty || 0
              })
            }
          })
          return transaction.update(change.after.ref, { stockUpdated: new Date() })
        })
      }).then(function () {
        console.log('Transaction successfully committed!')
      }).catch(function (error) {
        if (error) throw new Error(error)
      })
    })
  } else {
    return false
  }
}
