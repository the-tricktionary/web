const functions = require('firebase-functions')
const admin = require('firebase-admin')
const common = require('../common')
const PaymentEmails = require('../paymentEmails')

module.exports = (req, res) => {
  let sig = req.headers['stripe-signature']
  let event

  console.log('body', req.body)

  let stripe = require('stripe')(req.body.livemode ? functions.config().stripe.key : functions.config().stripe.testkey)
  let endpointSecret = (req.body.livemode ? functions.config().stripe.sign : functions.config().stripe.testsign)

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret)
  } catch (err) {
    res.status(400).end()
    throw new Error(err)
  }

  console.log('event', event)
  if (event.data.object.client_reference_id) {
    let ref = admin.firestore().collection('orders').doc(event.data.object.client_reference_id)
    let pRef = admin.firestore().collection('products')

    ref.get()
      .then(dSnap => {
        let data = dSnap.data()

        data.livemode = event.livemode
        data.paymentIntent = event.data.object.payment_intent
        data.paid = true
        data.paidItems = event.data.object.display_items
        data.received = admin.firestore.Timestamp.fromDate(new Date())

        data = common.sanitizeOrder(data)

        ref.set(data, { merge: true })
          .then(() => {
            console.log('presave success')
          })
          .catch((err) => {
            if (err) throw new Error(err)
          })

        pRef.get()
          .then(pQSnap => {
            let products = {}

            pQSnap.forEach(pDSnap => {
              products[pDSnap.id] = pDSnap.data()
            })
            console.log('sending email')
            PaymentEmails.success(data.customerDetails.email, {
              products,
              purchased: data.paidItems,
              customerDetails: data.customerDetails,
              currency: data.currency,
              livemode: data.livemode,
              id: dSnap.id
            })
              .then(() => {
                data.receiptSent = admin.firestore.Timestamp.fromDate(new Date())
                console.log('receipt sent')
                ref.set(data, { merge: true })
                  .then(() => {
                    console.log('sent')
                    res.status(200).end()
                  })
                  .catch(err => {
                    res.status(500).end()
                    if (err) throw new Error(err)
                  })
              })
              .catch(err => {
                res.status(500).end()
                if (err) throw new Error(err)
              })
          })
          .catch(err => {
            res.status(500).end()
            if (err) throw new Error(err)
          })
      })
      .catch(err => {
        res.status(500).end()
        if (err) throw new Error(err)
      })
  }
}
