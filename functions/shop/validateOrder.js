const admin = require('firebase-admin')
const request = require('request-promise-native')

module.exports = (change, context) => {
  let data = change.after.data()

  let promises = []

  let options = {
    method: 'GET',
    url: 'http://www.apilayer.net/api/validate',
    qs: {
      access_key: '738509b631dcb210ef6afe64dfdc75b4',
      vat_number: data.customerDetails.vatnumber
    },
    headers: {
      'cache-control': 'no-cache'
    },
    json: true
  }

  if (!data.vatVerified) {
    if (data.customerDetails.vatnumber) {
      let promise = request(options)
      promises.push(promise)
      promise.then(body => {
        console.log(body)
        return change.after.ref.update({ 'customerDetails.vatValid': body.valid, 'customerDetails.vatCountryCode': body.country_code, vatVerified: new Date() })
      })
        .catch(err => {
          throw new Error(err)
        })
    } else {
      promises.push(change.after.ref.update({ 'customerDetails.vatValid': false, 'customerDetails.vatCountryCode': '', vatVerified: new Date() }))
    }
  }

  if (!data.couponVerified) {
    let promise = admin.firestore().collection('shopSettings').doc('coupons').get()
    promises.push(promise)
    promise.then(dSnap => {
      if (dSnap.data()[data.coupon]) {
        return change.after.ref.update({ couponValid: true, couponVerified: new Date() })
      } else {
        return change.after.ref.update({ couponValid: false, couponVerified: new Date() })
      }
    })
  }

  return Promise.all(promises)
}
