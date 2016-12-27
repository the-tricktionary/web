var admin      = require("firebase-admin");
var objectdiff = require("objectdiff");
var fs         = require("fs");
var moment     = require("moment");

var serviceAccount = require("./email-data/firebase-adminsdk.json");

if(process.argv[2] == "test") {
  var mailgunConf   = require("./email-data/mailgun-test.json");
} else {
  var mailgunConf   = require("./email-data/mailgun-conf.json");
}

if (fs.existsSync("./email-data/last.json")) {
  var last = require("./email-data/last.json");
} else {
  var last;
  var init = true;
}

var mailgun    = require("mailgun-js")(mailgunConf);

// initialize firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-5641153190345267944.firebaseio.com"
});

// create db reference to contacts
var db  = admin.database();
var ref = db.ref("/contact");

ref.on("value", function(data) {
  if (!init) {
    var diff = objectdiff.diff(last, data.val()); // TODO: show what's changed
    console.log(diff.changed);
    // send email
    var emailData = {
      from:    "the Tricktionary <noreply@" + mailgunConf.domain + ">",
      to:      mailgunConf.to,
      subject: "Weekly contact summary " + moment().format("YYYY-MM-DD"),
      html:    "This week's contact node compared to last weeks contact node gave the result: <b>" + diff.changed + "</b><br/>The diff is currently limited, I'll make this report more detailed later"
    };
    mailgun.messages().send(emailData, function(err, body) {
      if (err) throw err;
      console.log("mail sent");
      fs.writeFile('./email-data/last.json', JSON.stringify(data.val()), function(err) {
        if (err) throw err;
        console.log("last.json written");
        process.exit();
      });
    });
  } else {
    fs.writeFile('./email-data/last.json', JSON.stringify(data.val()), function(err) {
      if (err) throw err;
      console.log("last.json written");
      process.exit();
    }); 
  }
})

// or use on("child_added") and run as daemon and save to weekly file and send on mondays

setTimeout(function() {
  console.log("timed out");
  process.exit();
}, 240000);
