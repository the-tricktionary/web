const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.sendSuggestedLevelNotification = functions.database.ref(
    '/tricks/{level}/subs/{trick}/levels/{federation}')
  .onWrite(event => {
    const data = event.data.val()
    console.log(data)
    if (typeof data.verified.suggestion !== 'undefined') {
      var ref = admin.database()
        .ref('/users')

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
              click_action: 'https://levels.the-tricktionary.com/admin#' +
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
