const request = require('request-promise-native')

module.exports = (data, context) => {
  console.log(data.customerDetails)
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

  if (data.customerDetails.vatnumber) {
    return request(options).then(body => {
      console.log(body)
      return { vat_valid: body.valid, vatCountryCode: body.country_code }
    })
      .catch(err => {
        throw new Error(err)
      })
  }
  return { vat_valid: false, vatCountryCode: '' }
}
