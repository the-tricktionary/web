const express = require('express')
const admin = require('firebase-admin')

let app = express()

function xmlStringify (obj, untranslatable) {
  if (typeof obj === 'undefined') return
  let output = ''
  if (typeof obj.values !== 'undefined') {
    output += `  <string-array name="${obj.id}"${(untranslatable ? ' translatable="false"' : '')}>\n`

    obj.values.forEach(value => {
      output += `    <item>${value.replace(/\n/g, '\\n')}</item>\n`
    })

    output += `  </string-array>\n`
  } else {
    output += `  <string name="${obj.id}"${(untranslatable ? ' translatable="false"' : '')}>${obj.value.replace(/\n/g, '\\n')}</string>\n`
  }

  return output
}

app.get('/:lang', (req, res) => {
  let lang = req.params.lang
  let ref = admin.database().ref('i18n')

  ref.once('value', snapshot => {
    let data = snapshot.val()
    let langsRef = admin.database().ref('langs')
    let untranslatable = ''
    let translated = ''
    let done = []
    let notTranslated = ''

    for (let id in data.untranslatable) {
      let obj = data.untranslatable[id]
      untranslatable += xmlStringify(obj, true)
    }

    for (let id in data.translated[lang]) {
      let obj = { id }
      if (Array.isArray(data.translated[lang][id])) {
        obj.values = data.translated[lang][id]
      } else {
        obj.value = data.translated[lang][id]
      }
      done.push(obj.id)

      translated += xmlStringify(obj)
    }

    for (let id in data.translated.en) {
      if (done.indexOf(id) >= 0) continue
      let obj = { id }
      if (Array.isArray(data.translated.en[id])) {
        obj.values = data.translated.en[id]
      } else {
        obj.value = data.translated.en[id]
      }

      notTranslated += xmlStringify(obj)
    }

    langsRef.once('value', langSnap => {
      let langsData = langSnap.val()
      let obj = {
        id: 'languages',
        values: Object.values(langsData)
      }
      let langs = ''

      langs += xmlStringify(obj)

      let output = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="lang_code">${lang}</string>
${langs}
  <!-- Private/Untranslatable strings -->
${untranslatable}

  <!-- Translable strings that has been translated -->
${translated}

  <!-- Translatable strings that haven't been translated -->
${notTranslated}
</resources>\n`

      res.send(output)
    })
  })
})

app.get('/', (req, res) => {
  let ref = admin.database().ref('/langs')

  ref.once('value', snapshot => {
    let data = snapshot.val()
    let keys = Object.keys(data)
    let output = keys.join(',')

    console.log(data, keys, output)

    res.send(output)
  })
})

// Expose Express API as a single Cloud Function:
module.exports = app
