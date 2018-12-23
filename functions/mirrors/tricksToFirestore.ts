const admin = require('firebase-admin')
const firestore = admin.firestore()
const common = require('./common')

module.exports = (change, context) => {
  let trick = change.after.val()

  trick.level = parseInt(context.params.level) + 1
  trick.oldid = trick.id1
  trick.videos = {}
  trick.videos.youtube = trick.video
  trick.slug = common.slugify(trick.name)
  trick.type = common.typeRenewer(trick.type)

  delete trick.id1
  delete trick.video
  delete trick.wjr
  delete trick.irsf

  trick.prerequisites = trick.prerequisites.filter(obj => {
    console.log(trick.level, trick.oldid, obj)
    let name = obj.name.toString().toLocaleLowerCase()
    return name !== 'none'
  })

  if (trick.prerequisites.length === 0) {
    delete trick.prerequisites
  }

  let srTricks = firestore.collection('tricksSR')

  return srTricks
    .where('level', '==', parseInt(context.params.level) + 1)
    .where('oldid', '==', parseInt(context.params.trick))
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        return srTricks.add(trick).then(ref => {
          console.log('Added document with ID: ', ref.id)
        })
      } else {
        return snapshot.docs[0].ref.set(trick).then(() => {
          console.log('Modified document with ID: ', snapshot.docs[0].ref.id)
        })
      }
    })
}
