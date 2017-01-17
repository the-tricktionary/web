var admin  = require("firebase-admin");
var fs     = require("fs");
var moment = require("moment");

var serviceAccount = require("./email-data/firebase-adminsdk.json");

if (process.argv.indexOf("test") !== -1) {
  function dlog(msg) { console.log(msg) }
  dlog("running in debug mode")
} else {
  function dlog(msg) { return true; }
}

// initialize firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-5641153190345267944.firebaseio.com"
});

dlog("init done");

// Get current datetime
var now = moment().format("X");

dlog("counting tricks " + now);

// create db reference
var db  = admin.database();
var ref = db.ref("/tricks");

ref.on("value", function(snapshot) {
  var levels = snapshot.val();
  var levelcount = Object.keys(levels).length;
  var levelObj = {
    "total": 0,
    "updated": now
  }

  for(var i = 0; i < levelcount; i++) {
    levelObj[i] = 0;
  }

  Object.keys(levels).forEach(function(level) {
    dlog("counting level " + level);
    levelObj[level] += Object.keys(levels[level].subs).length + 0;
    levelObj.total  += Object.keys(levels[level].subs).length + 0;
  })
  
  dlog(levelObj);
  
  dlog("counting total tricks completed");
  var ref1 = db.ref("/checklist");
  
  ref1.on("value", function(snapshot1) {
    var data = snapshot1.val();
    var totalObj = {
      "total": 0,
      "updated": now
    }
    for(var i = 0; i < levelcount; i++) {
      totalObj[i] = 0;
    }
    Object.keys(data).forEach(function(user) {
      dlog("counting " + user)
      Object.keys(data[user]).forEach(function(level) {
        totalObj[level] += Object.keys(data[user][level]).length + 0;
        totalObj.total  += Object.keys(data[user][level]).length + 0;
      })
    })
    dlog(totalObj)
    var statsRef = db.ref("/stats");
    statsRef.child("tricks").set(levelObj, function(err) {
      if (err) throw err;
      dlog("tricks stats saved")
      statsRef.child("checklist").set(totalObj, function(err) {
        if (err) throw err;
        dlog("checklist stats saved")
        process.exit();
      })
    })
  })
})

setTimeout(function() {
  console.log("backup failed, timeout");
  process.exit(1);
}, 180000);
