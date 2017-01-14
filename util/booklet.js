var admin  = require("firebase-admin");
var fs     = require("fs");
var moment = require("moment");
var sys = require('sys')
var exec = require('child_process').exec;
var child;

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

var filename = "booklet-" + now;

dlog("creating " + filename);

// create db reference
var db  = admin.database();
var ref = db.ref("/");

ref.on("value", function(data) {
  // construct tex file
  
  
   fs.writeFile('./booklets/' + filename + '.tex', texcont, function(err) {
    if (err) throw err;
    dlog("tex booklet saved");
    //exec pdflatex
    child = exec("pdflatex -synctex=1 -interaction=nonstopmode " + filename + ".tex", function (error, stdout, stderr) {
      dlog('stdout: ' + stdout);
      dlog('stderr: ' + stderr);
      if (error !== null) {
        dlog('exec error: ' + error);
      }
    });
  });
}

setTimeout(function() {
  console.log("backup failed, timeout");
  process.exit(1);
}, 180000);

