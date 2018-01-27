/* global importScripts, firebase, self */
importScripts('https://the-tricktionary.com/__/firebase/4.9.0/firebase-app.js')
importScripts('https://the-tricktionary.com/__/firebase/4.9.0/firebase-messaging.js')
importScripts('https://the-tricktionary.com/__/firebase/init.js')

const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ',
    payload)
  // Customize notification here
  const notificationTitle = 'the Tricktionary'
  const notificationOptions = {
    body: 'You\'ve recieved a new notification',
    icon: 'https://the-tricktionary.com/static/img/icon.png',
    click_action: 'https://the-tricktionary.com'
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})
