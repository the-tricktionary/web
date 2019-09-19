const functions = require('firebase-functions')
const Mailgen = require('mailgen')
const values = require('object.values')
const sanitizer = require('sanitizer')
const moment = require('moment')
const findBySku = require('./common').findBySku
const request = require('request')

if (!Object.values) {
  values.shim()
}

function send (mailData, context) {
  let mailDomain = (context.livemode ? 'the-tricktionary.com' : 'sandbox901848d2439549fdb402d967af69b50f.mailgun.org')
  let apikey = (context.livemode ? functions.config().mailgun.key : functions.config().mailgun.testkey)

  let options = {
    method: 'POST',
    url: `https://api:${apikey}@api.mailgun.net/v3/${mailDomain}/messages`,
    formData: mailData
  }

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) reject(new Error(error))

      return resolve(response.status)
    })
  })
}

function productsTable (products, purchased, mode) {
  let output = []
  let subtotal = 0
  let vat = 0
  let currency = ''

  for (let product of purchased) {
    let metadata = findBySku(products, product.sku.id, mode)
    let row = {
      quantity: product.quantity,
      item: metadata.name,
      'Unit Cost': `${Math.round(product.amount * (metadata.vatPaid ? (1 / (1 + metadata.vat)) : 1)) / 100} ${product.currency.toLocaleUpperCase()}/${metadata.unit || 'pcs'}`,
      VAT: metadata.vatPaid ? `${metadata.vat * 100}%` : '',
      total: `${Math.round(product.amount * (metadata.vatPaid ? (1 / (1 + metadata.vat)) : 1)) * product.quantity / 100} ${product.currency.toLocaleUpperCase()}`
    }

    currency = product.currency.toLocaleUpperCase()
    vat += metadata.vatPaid ? Math.round(product.amount * (1 - (1 / (1 + (metadata.vat || 0)))) * product.quantity) : 0
    subtotal += Math.round(product.amount * product.quantity)
    output.push(row)
  }
  output.push({
    quantity: '',
    item: '',
    unit_cost: '',
    vat: 'Subtotal',
    total: `${subtotal / 100} ${currency}`
  })
  if (vat > 0) {
    output.push({
      quantity: '',
      item: '',
      unit_cost: '',
      vat: 'VAT',
      total: `${vat / 100} ${currency}`
    })
  }
  output.push({
    quantity: '',
    item: '',
    unit_cost: '',
    vat: 'Total',
    total: `${(subtotal + vat) / 100} ${currency}`
  })
  return output
}

module.exports.success = (emailAddress, context) => {
  let mailDomain = (context.livemode ? 'the-tricktionary.com' : 'sandbox901848d2439549fdb402d967af69b50f.mailgun.org')

  let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      // Appears in header & footer of e-mails
      name: 'the Tricktionary',
      link: 'https://the-tricktionary.com',
      logo: 'https://the-tricktionary.com/static/img/icon512.png',
      copyright: `&copy; ${new Date().getFullYear()} <a href="https://the-tricktionary.com" target="_blank">the Tricktionary</a>. All rights reserved.<br/>Swantzer, Sweden, VAT: SE000718579601<br/><a href="https://v3.the-tricktionary.com/privacy" target="_blank">Privacy and Return Policy</a>`
    }
  })

  let email = {
    body: {
      name: sanitizer.sanitize(context.customerDetails.name),
      intro: [
        `Your order has been placed successfully. This is your receipt.`,
        `Receipt date: ${moment().format('YYYY-MM-DD')}`,
        `Receipt ID: ${context.id}`,
        sanitizer.sanitize(context.customerDetails.name),
        sanitizer.sanitize(context.customerDetails.address1),
        sanitizer.sanitize(context.customerDetails.address2),
        `${sanitizer.sanitize(context.customerDetails.state)} ${sanitizer.sanitize(context.customerDetails.postalCode)} ${sanitizer.sanitize(context.customerDetails.city)}`,
        sanitizer.sanitize(context.customerDetails.countryCode),
        context.livemode ? '' : '!!TESTMODE!! No charge has been made at your card, and no products will be delivered',
        "Thank you for your purchase, you'll be notified when your order ships, if your shipping address differs from your billing address above, please reply to this email as soon as possible."
      ].map(row => row.trim()).filter(row => row !== ''),
      table: {
        data: productsTable(context.products, context.purchased),
        columns: {
          // Optionally, customize the column widths
          // customWidth: {
          //   item: '20%',
          //   price: '15%'
          // },
          // Optionally, change column text alignment
          customAlignment: {
            price: 'right'
          }
        }
      }
    }
  // outro: ``
  }

  var emailBody = mailGenerator.generate(email)
  var emailText = mailGenerator.generatePlaintext(email)

  let mailgunData = {
    from: `the Tricktionary <noreply@${mailDomain}>`,
    'h:Reply-To': `the Tricktionary <shop@${mailDomain}>`,
    to: emailAddress,
    bcc: 'Svante Bengtson <svante@the-tricktionary.com>',
    subject: 'Order Placed on the Tricktionary',
    html: emailBody,
    text: emailText
  // attachment: new mailgun.Attachment({
  //   data: buffer,
  //   filename: `tricktionary-receipt-${context.id}.pdf`
  // })
  }

  return send(mailgunData, context)
}

module.exports.shipped = (emailAddress, context) => {
  let mailDomain = (context.livemode ? 'the-tricktionary.com' : 'sandbox901848d2439549fdb402d967af69b50f.mailgun.org')

  let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      // Appears in header & footer of e-mails
      name: 'the Tricktionary',
      link: 'https://the-tricktionary.com',
      logo: 'https://the-tricktionary.com/static/img/icon512.png',
      copyright: `&copy; ${new Date().getFullYear()} <a href="https://the-tricktionary.com" target="_blank">the Tricktionary</a>. All rights reserved.<br/>Swantzer, Sweden, VAT: SE000718579601<br/><a href="https://v3.the-tricktionary.com/privacy" target="_blank">Privacy and Return Policy</a>`
    }
  })

  let email = {
    body: {
      name: sanitizer.sanitize(context.customerDetails.name),
      intro: [
        `Once again thank you for your order, we wanted to inform you that your order has been shipped`,
        `Order ID: ${context.id}`,
        (context.tracking ? `Your order has the following package id` : `Unfortunately, your package can't be traced`),
        (context.tracking ? `<a href="https://tracking.postnord.com/se/?id=${context.tracking}6&lang=en" target="_blank" rel="noopener">${context.tracking}</a>` : ``),
        (context.tracking ? `You can follow it on https://tracking.postnord.com/se` : ``),
        context.livemode ? '' : '!!TESTMODE!! Nothing has actually been shipped'
      ].map(row => row.trim()).filter(row => row !== '')
    }
  }

  var emailBody = mailGenerator.generate(email)
  var emailText = mailGenerator.generatePlaintext(email)

  let mailgunData = {
    from: `the Tricktionary <noreply@${mailDomain}>`,
    'h:Reply-To': `the Tricktionary <shop@${mailDomain}>`,
    to: emailAddress,
    bcc: 'Svante Bengtson <svante@the-tricktionary.com>',
    subject: 'Your Order from the Tricktioanry has been Shipped',
    html: emailBody,
    text: emailText
  // attachment: new mailgun.Attachment({
  //   data: buffer,
  //   filename: `tricktionary-receipt-${context.id}.pdf`
  // })
  }

  return send(mailgunData, context)
}
