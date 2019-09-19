const sanitizer = require('sanitizer')

exports.typeRenewer = function (str) {
  return str.toString().toLocaleLowerCase().trim()
    .replace(/s$/g, '')
}

// from https://gist.github.com/mathewbyrne/1280286
exports.slugify = function (text) {
  return text.toString().toLocaleLowerCase().trim()
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word characters and dashes with a single dash (-)
    .replace(/^-+|-+$/g, '') // remove leading, trailing -
}

exports.findBySku = (products, sku) => {
  let vatPaid = false
  let id = Object.keys(products).filter((id) => {
    let skus = Object.keys(products[id].skus)
      .map(key => ({ sku: products[id].skus[key], currency: key.split('-')[0], vat: key.split('-').length === 2 }))
      .concat(Object.keys(products[id]['test-skus'])
        .map(key => ({ sku: products[id]['test-skus'][key], currency: key.split('-')[0], vat: key.split('-').length === 2 })))
    let idx = skus.findIndex(obj => obj.sku === sku)
    if (idx >= 0) {
      vatPaid = skus[idx].vat
      return true
    }
    return false
  })[0]
  let output = products[id] || {}
  output.vatPaid = vatPaid
  output.id = id
  return output
}

exports.sanitizeOrder = (order) => ({
  currency: (sanitizer.sanitize(order.currency) || '').trim(),
  coupon: (sanitizer.sanitize(order.coupon) || '').trim(),
  customerDetails: {
    address1: (sanitizer.sanitize(order.customerDetails.address1) || '').trim(),
    address2: (sanitizer.sanitize(order.customerDetails.address2) || '').trim(),
    city: (sanitizer.sanitize(order.customerDetails.city) || '').trim(),
    company: (sanitizer.sanitize(order.customerDetails.company) || '').trim(),
    countryCode: (sanitizer.sanitize(order.customerDetails.countryCode) || '').trim(),
    email: (sanitizer.sanitize(order.customerDetails.email) || '').trim(),
    name: (sanitizer.sanitize(order.customerDetails.name) || '').trim(),
    phone: (sanitizer.sanitize(order.customerDetails.phone) || '').trim(),
    postalCode: (sanitizer.sanitize(order.customerDetails.postalCode) || '').trim(),
    state: (sanitizer.sanitize(order.customerDetails.state) || '').trim(),
    vatnumber: (sanitizer.sanitize(order.customerDetails.vatnumber) || '').trim()
  },
  requestedItems: (order.requestedItems || []).map(item => ({ quantity: Number(item.quantity), sku: sanitizer.sanitize(item.sku).trim() })),
  livemode: order.livemode || false,
  paid: order.paid || false,
  paidItems: order.paidItems || [],
  paymentIntent: (order.paymentIntent || '').trim(),
  received: order.received || new Date(),
  sanitized: order.sanitized || new Date()
})
