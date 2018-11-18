const admin = require('firebase-admin')
const firestore = admin.firestore()

// from https://gist.github.com/mathewbyrne/1280286
function slugify (text) {
  return text.toString().toLocaleLowerCase().trim()
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word characters and dashes with a single dash (-)
    .replace(/^-+|-+$/g, '') // remove leading, trailing -
}

function typeRenewer (str) {
  return str.toString().toLocaleLowerCase().trim()
    .replace(/s$/g, '')
}

module.exports = (change, context) => {
  let trick = change.after.val()

  trick.level = parseInt(context.params.level) + 1
  trick.oldid = trick.id1
  trick.videos = {}
  trick.videos.youtube = trick.video
  trick.slug = slugify(trick.name)
  trick.type = typeRenewer(trick.type)

  delete trick.id1
  delete trick.video
  delete trick.wjr
  delete trick.irsf

  trick.prerequisites = trick.prerequisites.filter(obj => {
    let name = obj.name.toLocaleLowerCase()
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
        return srTricks.add(trick)
      } else {
        return snapshot.docs[0].ref.set(trick)
      }
    })
}
