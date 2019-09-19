const PaymentEmails = require('../paymentEmails')
const admin = require('firebase-admin')

module.exports = (data, context) => {
  let ref = admin.firestore().collection('orders').doc(data.id)
  let uRef = admin.firestore().collection('users').doc(context.auth.uid)

  return uRef.get()
    .then(uDSnap => {
      console.log(uDSnap.data(), context.auth.uid)
      if (uDSnap.data().admin === true) {
        return ref.get()
          .then(dSnap => {
            let data = dSnap.data()
            return PaymentEmails.shipped(data.customerDetails.email, {
              livemode: data.livemode,
              tracking: data.tracking,
              customerDetails: data.customerDetails,
              id: dSnap.id
            })
              .then(() => {
                return ref.update({
                  shippingEmailSent: new Date(),
                  shipped: new Date(),
                  tracking: data.tracking
                })
              })
          })
      } else {
        return false
      }
    })
}
