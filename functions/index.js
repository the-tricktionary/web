const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const values = require('object.values')
admin.initializeApp(functions.config().firebase)

if (!Object.values) {
  values.shim()
}

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
      let obj = {id}
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
      let obj = {id}
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
exports.i18nApi = functions.https.onRequest(app)

exports.sendSuggestedLevelNotification = functions.database.ref('/tricks/{level}/subs/{trick}/levels/{federation}')
  .onWrite(event => {
    const data = event.data.val()
    console.log(data)
    if (typeof data.verified.suggestion !== 'undefined') {
      var ref = admin.database().ref('/users')

      return ref.once('value', snapshot => {
        var users = snapshot.val()
        var tokens = []

        if (typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'] !== 'undefined' &&
          typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'].fcm !== 'undefined' &&
          typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'].fcm['levels-web'] !==
          'undefined') {
          tokens.push(users['g0G3A7FxieN333lZ2RKclkmv9Uw1'].fcm['levels-web'])
        }

        if (typeof users['Kpz3afszjBR0qwZYUrKURRJx2cm2'] !== 'undefined' &&
          typeof users['Kpz3afszjBR0qwZYUrKURRJx2cm2'].fcm !== 'undefined' &&
          users['Kpz3afszjBR0qwZYUrKURRJx2cm2'].fcm['levels-web'] !== 'undefined') {
          tokens.push(users['Kpz3afszjBR0qwZYUrKURRJx2cm2'].fcm['levels-web'])
        }

        if (typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'] !== 'undefined' &&
          typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'].fcm !== 'undefined' &&
          typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'].fcm['android'] !==
          'undefined') {
          tokens.push(users['g0G3A7FxieN333lZ2RKclkmv9Uw1'].fcm['android'])
        }

        if (typeof users['Kpz3afszjBR0qwZYUrKURRJx2cm2'] !== 'undefined' &&
          typeof users['Kpz3afszjBR0qwZYUrKURRJx2cm2'].fcm !== 'undefined' &&
          users['Kpz3afszjBR0qwZYUrKURRJx2cm2'].fcm['android'] !== 'undefined') {
          tokens.push(users['Kpz3afszjBR0qwZYUrKURRJx2cm2'].fcm['android'])
        }

        var trickRef = admin.database()
          .ref('/tricks')
          .child(event.params.level)
          .child('subs')
          .child(event.params.trick)
        return trickRef.once('value', snapshot => {
          var trick = snapshot.val()
          var payload = {
            notification: {
              title: 'New Level Suggested',
              body: `A new ${event.params.federation} Level has been suggested for ${trick.name}`,
              icon: 'https://the-tricktionary.com/static/img/icon.png',
              click_action: 'https://admin.the-tricktionary.com/levels#' +
                (event.params.level) + '' + (event.params.trick)
            }
          }

          return admin.messaging()
            .sendToDevice(tokens, payload)
            .then(function (response) {
              // See the MessagingDevicesResponse reference documentation for
              // the contents of response.
              console.log('Successfully sent message:', response)
            })
            .catch(function (error) {
              console.log('Error sending message:', error)
            })
        })
      })
    }
  })

exports.moveTranslatableToTranslatedEnglish = functions.database.ref('/i18n/translatable/{string}')
  .onWrite(event => {
    const data = event.data.val()
    console.log(data)

    const id = data.id
    const value = (typeof data.value === 'undefined' ? data.values : data.value)

    return event.data.adminRef.parent.parent.child('translated').child('en').child(id).set(value)
  })

exports.moveUsernames = functions.database.ref('/users/{uid}/profile/username')
  .onWrite(event => {
    const data = event.data.val()

    return event.data.adminRef.root.child('usernames').child(data.toLowerCase()).set(event.params.uid)
  })

exports.moveCoaches = functions.database.ref('/users/{uid}/coaches/{uname}')
    .onWrite(event => {
      const data = event.data.val()

      let getCUid = () => {
        let cuid
        if (event.params.uname.length > 20) {
          cuid = event.params.uname
          return getUname(cuid)
        } else {
          return event.data.adminRef.root.child('usernames').child(event.params.uname).once('value', snapshot => {
            cuid = snapshot.val()
            if (cuid === null || cuid === undefined) {
              return true
            }
            if (data !== true) {
              return event.data.adminRef.root.child('users').child(cuid).child('students').child(event.params.uid).remove()
            }
            getUname(cuid)
          })
        }
      }

      let getUname = cuid => {
        let uname
        return event.data.adminRef.parent.parent.child('profile').once('value', snapshot => {
          var data = snapshot.val()
          if (typeof data.name === 'undefined') {
            uname = data.username
          } else {
            uname = data.name.join(' ')
          }
          return set(cuid, uname)
        })
      }

      let set = (cuid, uname) => {
        if (data === true) {
          return event.data.adminRef.root.child('users').child(cuid).child('students').child(event.params.uid).set(uname)
        } else {
          return true
        }
      }

      getCUid()
    })

exports.friendRequest = functions.database.ref('/users/{uid}/friends/{uname}')
  .onWrite(event => {
    const data = event.data.val()

    let renameToUid = (uid, uname) => {
      event.data.adminRef.root.child('users').child(event.params.uid).child('friends').child(uname).remove()
      event.data.adminRef.root.child('users').child(event.params.uid).child('friends').child(uid).set({mutual: false, username: uname.toLowerCase()})
      return 'renamed'
    }

    let checkMutual = uid => {
      if (data === null || typeof data === 'undefined') {
        return removeFriend(uid)
      }
      return event.data.adminRef.root.child('users').child(uid).child('friends').child(event.params.uid).once('value', snapshot => {
        const otherData = snapshot.val()

        if ((otherData === null || typeof otherData === 'undefined') && (data !== null || typeof data !== 'undefined')) {
          sendFriendRequest(uid)
        } else {
          event.data.adminRef.root.child('users').child(event.params.uid).child('friends').child(uid).child('mutual').set(true)
          event.data.adminRef.root.child('users').child(uid).child('friends').child(event.params.uid).child('mutual').set(true)
        }
      })
    }

    let sendFriendRequest = uid => {
      return event.data.adminRef.root.child('users').child(event.params.uid).child('profile').once('value', snapshot => {
        const profile = snapshot.val()

        event.data.adminRef.root.child('users').child(uid).child('friendrequests').child(event.params.uid).set({username: profile.username, name: profile.name})

        event.data.adminRef.root.child('users').child(uid).child('fcm').once('value', snapshot => {
          let fcm = snapshot.val()

          if (fcm === null || typeof fcm === 'undefined') return 'no notification targets'

          let payloadWeb = {
            notification: {
              title: 'Friend Request',
              body: `${profile.username} has sent you a friend request`,
              icon: 'https://the-tricktionary.com/static/img/icon.png',
              click_action: 'https://the-tricktionary.com/profile#friends'
            }
          }
          let payloadAndroid = {
            notification: {
              title: 'Friend Request',
              body: `${profile.username} has sent you a friend request`
              // click_action: ''
            }
          }

          let tokensWeb = (typeof fcm.web === 'string' ? fcm.web : Object.values(fcm.web))
          let tokensAndroid = (typeof fcm.android === 'string' ? fcm.android : Object.values(fcm.android))

          admin.messaging()
          .sendToDevice(tokensWeb, payloadWeb)
          .then(function (response) {
            // See the MessagingDevicesResponse reference documentation for
            // the contents of response.
            console.log('Successfully sent message:', response)
          })
          .catch(function (error) {
            console.log('Error sending message:', error)
          })

          admin.messaging()
          .sendToDevice(tokensAndroid, payloadAndroid)
          .then(function (response) {
            // See the MessagingDevicesResponse reference documentation for
            // the contents of response.
            console.log('Successfully sent message:', response)
          })
          .catch(function (error) {
            console.log('Error sending message:', error)
          })
        })
      })
    }

    let removeFriend = uid => {
      event.data.adminRef.root.child('users').child(uid).child('friends').child(event.params.uid).remove()
      event.data.adminRef.root.child('users').child(uid).child('friendrequests').child(event.params.uid).remove()
      return 'removed'
    }

    let cuid
    if (event.params.uname.length > 20) {
      cuid = event.params.uname
      return checkMutual(cuid)
    } else {
      return event.data.adminRef.root.child('usernames').child(event.params.uname.toLowerCase()).once('value', snapshot => {
        cuid = snapshot.val()
        if (cuid === null || cuid === undefined) {
          return event.data.adminRef.remove()
        }
        return renameToUid(cuid, event.params.uname)
      })
    }
  })
