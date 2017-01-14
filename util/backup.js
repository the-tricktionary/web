var admin  = require("firebase-admin");
var fs     = require("fs");
var moment = require("moment");

var serviceAccount = require("./email-data/firebase-adminsdk.json");

if (process.argv[2] == "test") {
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
var now = moment().format("YYYYMMDD-HHmmss");

dlog("backing up db " + now);

// create db reference to contacts
var db  = admin.database();
var ref = db.ref("/");

ref.on("value", function(data) {
  dlog("recieved data, writing to file ./backups/backup-" + now + ".json")
  fs.writeFile('./backups/backup-' + now + '.json', JSON.stringify(data.val()), function(err) {
    if (err) throw err;
    dlog("backup saved");
    process.exit();
  });
})

setTimeout(function() {
  console.log("backup failed, timeout");
  process.exit(1);
}, 60000);
