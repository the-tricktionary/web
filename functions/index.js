const functions = require('firebase-functions')
const admin = require('firebase-admin')
const values = require('object.values')
admin.initializeApp()

let settings = { timestampsInSnapshots: true }
admin.firestore().settings(settings)

if (!Object.values) {
  values.shim()
}

const uniqueFilter = (val, inx, self) => self.indexOf(val) === inx

exports.i18nApi = functions.https.onRequest(require('./i18nApi'))

exports.updateUserCount = functions.auth.user().onCreate(user => {
  return admin.database().ref('stats/users/registered').transaction(userCount => (userCount || 0) + 1)
})

exports.sendSuggestedLevelNotification = functions.database.ref('/tricks/{level}/subs/{trick}/levels/{federation}')
  .onWrite((change, context) => {
    const data = change.afetr.val()
    console.log(data)
    if (typeof data.verified.suggestion !== 'undefined') {
      var ref = admin.database().ref('/users')

      return ref.once('value', snapshot => {
        var users = snapshot.val()
        var tokens = []

        if (typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'] !== 'undefined' &&
          typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'].fcm !== 'undefined' &&
          typeof users['g0G3A7FxieN333lZ2RKclkmv9Uw1'].fcm['levels-web'] !== 'undefined') {
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
          .child(context.params.level)
          .child('subs')
          .child(context.params.trick)
        return trickRef.once('value', snapshot => {
          var trick = snapshot.val()
          var payload = {
            notification: {
              title: 'New Level Suggested',
              body: `A new ${context.params.federation} Level has been suggested for ${trick.name}`,
              icon: 'https://the-tricktionary.com/static/img/icon.png',
              click_action: 'https://admin.the-tricktionary.com/levels#' +
                (context.params.level) + '' + (context.params.trick)
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
  .onWrite((change, context) => {
    const data = change.after.val()
    console.log(data)

    const id = data.id
    const value = (typeof data.value === 'undefined' ? data.values : data.value)

    return change.after.ref.parent.parent.child('translated').child('en').child(id).set(value)
  })

exports.moveUsernames = functions.database.ref('/users/{uid}/profile/username')
  .onWrite((change, context) => {
    const data = change.after.val()

    return change.after.ref.root.child('usernames').child(data.toLowerCase()).set(context.params.uid)
  })

exports.moveCoaches = functions.database.ref('/users/{uid}/coaches/{uname}')
  .onWrite((change, context) => {
    const data = change.after.val()

    let getCUid = () => {
      let cuid
      if (context.params.uname.length > 20) {
        cuid = context.params.uname
        return getUname(cuid)
      } else {
        return change.after.ref.root.child('usernames').child(context.params.uname).once('value', snapshot => {
          cuid = snapshot.val()
          if (cuid === null || cuid === undefined) {
            return true
          }
          if (data !== true) {
            return change.after.ref.root.child('users').child(cuid).child('students').child(context.params.uid).remove()
          }
          getUname(cuid)
        })
      }
    }

    let getUname = cuid => {
      let uname
      return change.after.ref.parent.parent.child('profile').once('value', snapshot => {
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
        return change.after.ref.root.child('users').child(cuid).child('students').child(context.params.uid).set(uname)
      } else {
        return true
      }
    }

    return getCUid()
  })

exports.friendRequest = functions.database.ref('/users/{uid}/friends/{uname}')
  .onWrite((change, context) => {
    const data = change.after.val()

    let renameToUid = (uid, uname) => {
      change.after.ref.root.child('users').child(context.params.uid).child('friends').child(uname).remove()
      change.after.ref.root.child('users').child(context.params.uid).child('friends').child(uid).set({ mutual: false, username: uname.toLowerCase() })
      return 'renamed'
    }

    let setUsername = (uid) => {
      return change.after.ref.root.child('users').child(uid).child('profile').child('username').once('value', snapshot => {
        let uname = snapshot.val()
        change.after.ref.child('username').set(uname)
      })
    }

    let checkMutual = uid => {
      if (data === null || typeof data === 'undefined') {
        return removeFriend(uid)
      }
      return change.after.ref.root.child('users').child(uid).child('friends').child(context.params.uid).once('value', snapshot => {
        const otherData = snapshot.val()

        if ((otherData === null || typeof otherData === 'undefined') && (data !== null || typeof data !== 'undefined')) {
          sendFriendRequest(uid)
        } else {
          change.after.ref.root.child('users').child(context.params.uid).child('friends').child(uid).child('mutual').set(true)
          change.after.ref.root.child('users').child(uid).child('friends').child(context.params.uid).child('mutual').set(true)
        }
      })
    }

    let sendFriendRequest = uid => {
      return change.after.ref.root.child('users').child(context.params.uid).child('profile').once('value', snapshot => {
        const profile = snapshot.val()

        change.after.ref.root.child('users').child(uid).child('friendrequests').child(context.params.uid).set({ username: profile.username, name: profile.name || [] })

        change.after.ref.root.child('users').child(uid).child('fcm').once('value', snapshot => {
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

          if (fcm.web !== null || typeof fcm.web !== 'undefined') {
            let tokensWeb = (typeof fcm.web === 'string' ? fcm.web : Object.values(fcm.web).filter(uniqueFilter))
            admin.messaging().sendToDevice(tokensWeb, payloadWeb)
              .then(function (response) {
                // See the MessagingDevicesResponse reference documentation for
                // the contents of response.
                console.log('Successfully sent message:', response)
              })
              .catch(function (error) {
                console.log('Error sending message:', error)
              })
          }

          if (fcm.android !== null || typeof fcm.android !== 'undefined') {
            let tokensAndroid = (typeof fcm.android === 'string' ? fcm.android : Object.values(fcm.android).filter(uniqueFilter))
            admin.messaging().sendToDevice(tokensAndroid, payloadAndroid)
              .then(function (response) {
                // See the MessagingDevicesResponse reference documentation for
                // the contents of response.
                console.log('Successfully sent message:', response)
              })
              .catch(function (error) {
                console.log('Error sending message:', error)
              })
          }
        })
      })
    }

    let removeFriend = uid => {
      change.after.ref.root.child('users').child(uid).child('friends').child(context.params.uid).remove()
      change.after.ref.root.child('users').child(uid).child('friendrequests').child(context.params.uid).remove()
      return 'removed'
    }

    let cuid
    if (context.params.uname.length > 20) {
      cuid = context.params.uname
      if (data.username === null || typeof data.username === 'undefined') {
        return setUsername(cuid)
      }
      return checkMutual(cuid)
    } else {
      return change.after.ref.root.child('usernames').child(context.params.uname.toLowerCase()).once('value', snapshot => {
        cuid = snapshot.val()
        if (cuid === null || cuid === undefined) {
          return change.after.ref.remove()
        }
        return renameToUid(cuid, context.params.uname)
      })
    }
  })

exports.stripeWebhook = functions.https.onRequest(require('./shop/stripeWebhook'))

// exports.sanitizeOrder = functions.firestore.document('/orders/{order}').onUpdate(require('./shop/sanitizeOrder'))
exports.validateOrder = functions.firestore.document('/orders/{order}').onUpdate(require('./shop/validateOrder'))
// exports.sendReceipt = functions.firestore.document('/orders/{order}').onUpdate(require('./shop/sendReceipt'))
exports.updateStock = functions.firestore.document('/orders/{order}').onUpdate(require('./shop/updateStock'))
// exports.sendShippmentEmail = functions.firestore.document('/orders/{order}').onUpdate(require('./shop/sendShippmentEmail'))

exports.verifyBusiness = functions.https.onCall(require('./shop/verifyBusiness'))
exports.verifyCoupon = functions.https.onCall(require('./shop/verifyCoupon'))
exports.shipped = functions.https.onCall(require('./shop/sendShippmentEmail'))

// Mirrors
// exports.tricksToFirestore = functions.database.ref('/tricks/{level}/subs/{trick}').onWrite(require('./mirrors/tricksToFirestore'))
// exports.languagesToFirestore = functions.database.ref('/langs/{lang}').onWrite(require('./mirrors/languagesToFirestore'))
// exports.tricktypesToFirestore = functions.database.ref('/tricktypes/{lang}').onWrite(require('./mirrors/tricktypesToFirestore'))

// Speed Mirror
exports.speed = {
  RTD: {
    create: functions.database.ref('/speed/scores/{uid}/{created}').onCreate(require('./mirrors/speedToFirestore').create),
    update: functions.database.ref('/speed/scores/{uid}/{created}').onUpdate(require('./mirrors/speedToFirestore').update),
    delete: functions.database.ref('/speed/scores/{uid}/{created}').onDelete(require('./mirrors/speedToFirestore').delete)
  },
  FS: {
    create: functions.firestore.document('/speed/{doc}').onCreate(require('./mirrors/speedToRTD').create),
    update: functions.firestore.document('/speed/{doc}').onUpdate(require('./mirrors/speedToRTD').update),
    delete: functions.firestore.document('/speed/{doc}').onDelete(require('./mirrors/speedToRTD').delete)
  }
}

// Checklist Mirror
exports.checklist = {
  RTD: {
    write: functions.database.ref('/checklist/{uid}/{level}/{trick}').onWrite(require('./mirrors/checklistToFirestore').write)
  // create: functions.database.ref('/checklist/{uid}/{level}/{trick}').onCreate(require('./mirrors/speedToFirestore').create),
  // update: functions.database.ref('/speed/scores/{uid}/{created}').onUpdate(require('./mirrors/speedToFirestore').update),
  // delete: functions.database.ref('/speed/scores/{uid}/{created}').onDelete(require('./mirrors/speedToFirestore').delete)
  },
  FS: {
    // create: functions.firestore.document('/speed/{doc}').onCreate(require('./mirrors/speedToRTD').create),
    // update: functions.firestore.document('/speed/{doc}').onUpdate(require('./mirrors/speedToRTD').update),
    // delete: functions.firestore.document('/speed/{doc}').onDelete(require('./mirrors/speedToRTD').delete)
  }
}
