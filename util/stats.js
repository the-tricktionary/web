var admin = require("firebase-admin");
var fs = require("fs");
var moment = require("moment");

var serviceAcount = require("./email-data/firebase-adminsdk.json");

if (process.argv.indexOf("test") !== -1) {
  function dlog(msg) {
    console.log(msg)
  }
  dlog("running in debug mode")
} else {
  function dlog(msg) {
    return true;
  }
}

// initialize firebase app
admin.initializeApp({
  credential:  admin.credential.cert(serviceAccount),
  databaseURL: "https://project-5641153190345267944.firebaseio.com"
});

dlog("init done");

// Get current datetime
function now() {
  return moment().format("X");
}

dlog("started " + now());

// create db reference
var db       = admin.database();
var statsRef = db.ref("/stats");
var listRef  = db.ref("/checklist");
var trickRef = db.ref("/tricks");

trickRef.on("value", function(snapshot) {
  var levels     = snapshot.val();
  var levelcount = Object.keys(levels).length;
  var levelObj   = {
    "total": 0,
    "updated": now()
  }

  for (var i = 0; i < levelcount; i++) {
    levelObj[i] = 0;
  }

  Object.keys(levels)
    .forEach(function(level) {
      dlog("counting level " + level);
      levelObj[level] += Object.keys(levels[level].subs).length + 0;
      levelObj.total  += Object.keys(levels[level].subs).length + 0;
    })

  dlog(levelObj);
  dlog("counting total tricks completed");

  statsRef.child("tricks").set(levelObj, function(err) {
    if (err) throw err;
    dlog("tricks stats saved")
  })
})


listRef.on("value", function(snapshot) {
  var data     = snapshot.val();
  var totalObj = {
    "total": 0,
    "avg": 0,
    "max": 0,
    "updated": now()
  }
  var users = Object.keys(data).length;
  Object.keys(data).forEach(function(user) {
    dlog("counting " + user)
    var userTotal = 0;
    Object.keys(data[user]).forEach(function(level) {
      if (!totalObj[level]) {
       totalObj[level] = 0; 
      }
      var len = Object.keys(data[user][level]).reduce(function(a, b) { 
        return (data[user][level][b] ? ++a : a) 
      },0)
      userTotal       += len;
      totalObj[level] += len;
      totalObj.total  += len;
    })
    if (userTotal > totalObj.max ) {
      totalObj.max = userTotal;
    }
  })
  totalObj.avg = Math.round(totalObj.total / users)
  dlog(totalObj)
  
  statsRef.child("checklist").set(totalObj, function(err) {
    if (err) throw err;
    dlog("checklist stats saved")
  })
})

/*setTimeout(function() {
  console.log("backup failed, timeout");
  process.exit(1);
}, 180000);*/

