const functions = require('firebase-functions')
const admin = require('firebase-admin')
const PaymentEmails = require('../paymentEmails')

module.exports = (change, context) => {
  let data = change.after.data()

  if (data.sanitized && data.paid && data.vatVerified && data.couponVerified && !data.receiptSent) {
    return admin.firestore().collection('products').get().then(qSnap => {
      let products = {}

      qSnap.forEach(dSnap => {
        products[dSnap.id] = dSnap.data()
      })
      return PaymentEmails.success(data.customerDetails.email, {
        products,
        purchased: data.paidItems,
        customerDetails: data.customerDetails,
        currency: data.currency,
        livemode: data.livemode,
        id: change.after.id
      }, change.after)
    })
  } else {
    return false
  }
}
