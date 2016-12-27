var admin  = require("firebase-admin");
var fs     = require("fs");
var moment = require("moment");

var serviceAccount = require("./email-data/firebase-adminsdk.json");

// initialize firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-5641153190345267944.firebaseio.com"
});

// Get current datetime
var now = moment().format("YYYYMMDD-HHmmss");

console.log("backing up db" + now);

// create db reference to contacts
var db  = admin.database();
var ref = db.ref("/");

ref.on("value", function(data) {
  fs.writeFile('./backups/backup-' + now + '.json', JSON.stringify(data.val()), function(err) {
    if (err) throw err;
    console.log("backup saved");
    process.exit()
  });
})

setTimeout(function() {
  console.log("backup failed, timeout");
  process.exit(1);
}, 60000);
