/* global firebase */

let common = {}

common.typeRenewer = str => str.toString().toLocaleLowerCase().trim().replace(/s$/g, '')

common.slugify = text => text.toString().toLocaleLowerCase().trim()
  .replace(/&/g, '-and-')
  .replace(/[\s\W-]+/g, '-')
  .replace(/^-+|-+$/g, '')

common.findId = (id0, id1, docs) => docs[docs.findIndex(doc => doc.get('level') === parseInt(id0) + 1 && doc.get('oldid') === parseInt(id1))].id

let srTricks = firebase.firestore().collection('tricksSR')

firebase.database().ref('tricks').on('value', snap => {
  let data = snap.val()

  data.forEach(level => {
    let lev = level.id0 + 1

    level.subs.forEach(trick => {
      trick.oldid = trick.id1
      trick.level = lev
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

      return srTricks
        .where('level', '==', lev)
        .where('oldid', '==', trick.oldid)
        .get()
        .then(snapshot => {
          if (snapshot.empty) {
            return srTricks.add(trick).then(ref => {
              console.log('Added document with ID:', ref.id)
            })
          } else {
            return snapshot.docs[0].ref.set(trick).then(() => {
              console.log('Modified document with ID:', snapshot.docs[0].ref.id)
            })
          }
        })
    })
  })
})

srTricks.get().then(snapshot => {
  let docs = snapshot.docs
  docs.forEach(doc => {
    let data = doc.data()
    if (!data.prerequisites || data.prerequisites.length === 0) return
    console.log(data.prerequisites)
    data.prerequisites = data.prerequisites.map(req => {
      let output = {
        id: common.findId(req.id0, req.id1, docs),
        ref: firebase.firestore().collection('tricksSR').doc(common.findId(req.id0, req.id1, docs))
      }
      return output
    })
    console.log(data.prerequisites, doc.id)
    doc.ref.update({ prerequisites: data.prerequisites })
  })
})

srTricks.get().then(snapshot => {
  let docs = snapshot.docs
  docs.forEach(doc => {
    let data = doc.data()
    if (!data.i18n) return
    console.log(data.i18n)

    let langs = Object.keys(data.i18n)

    langs.forEach(lang => {
      firebase.firestore().collection('i18n').doc(lang).collection('tricks').doc(doc.id).set(data.i18n[lang])
        .then(() => {
          console.log('Saved lang', lang, 'for document', doc.id)
        })
    })

    doc.ref.update({ i18n: firebase.firestore.FieldValue.delete() }).then(() => {
      console.log('Modified document with ID:', doc.id)
    })
  })
})

srTricks.get().then(snapshot => {
  let docs = snapshot.docs
  docs.forEach(doc => {
    let data = doc.data()
    if (!data.levels) return
    console.log(data.levels)

    let orgs = Object.keys(data.levels)

    orgs.forEach(org => {
      data.levels[org].level = '' + data.levels[org].level
    })

    doc.ref.update({ levels: data.levels }).then(() => {
      console.log('Modified document with ID:', doc.id)
    })
  })
})
