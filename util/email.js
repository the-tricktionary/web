var admin      = require("firebase-admin");
var objectdiff = require("objectdiff");
var fs         = require("fs");
var moment     = require("moment");

var serviceAccount = require("./email-data/firebase-adminsdk.json");

if(process.argv[2] == "test") {
  var mailgunConf   = require("./email-data/mailgun-test.json");
  function dlog(msg) {
    console.log(msg);
  }
  dlog("running in debug mode");
} else {
  var mailgunConf   = require("./email-data/mailgun-conf.json");
  function dlog(msg) {
    return true;
  }
}

if (fs.existsSync("./email-data/last.json")) {
  var last = require("./email-data/last.json");
} else {
  var last;
  var init = true;
}

if (init) {
  dlog("first run");
} else {
  dlog("got last data");
}

var mailgun    = require("mailgun-js")(mailgunConf);

// initialize firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-5641153190345267944.firebaseio.com"
});


dlog("init done");

function checker(obj) {
  diffedchilds = [];
  Object.keys(obj.value).forEach(function(key) { 
    if (obj.value[key].changed !== "equal") {
      dlog("diff in " + key + ": " + obj.value[key].changed );
      diffedchilds.push(key);
    }
  })
  return diffedchilds;
}

function checker1(obj, arr) {
  diffedchilds = [];
  arr.forEach(function(key) {
    if(obj.value[key] && obj.value[key].changed == "added") {
      Object.keys(obj.value[key].value).forEach(function(addedKey) {
        dlog("diff in " + key + "/" + addedKey + ": added")
        diffedchilds.push({"key": addedKey, "value": obj.value[key].value[addedKey], "changed": "added"})
      })
    } else if (obj.value[key] && obj.value[key].changed == "object change") {
      Object.keys(obj.value[key].value).forEach(function(changedKey) {
        if (obj.value[key].value[changedKey].changed == "added") {
          dlog("diff in " + key + "/" + changedKey + ": added")
          diffedchilds.push({"key": changedKey, "value": obj.value[key].value[changedKey].value, "changed": "added"})
        } else if (obj.value[key].value[changedKey].changed == "object change") {
          dlog("diff in " + key + "/" + changedKey + ": object change")
          diffedchilds.push({"user": key, "key": changedKey, "value": obj.value[key].value[changedKey].value, "changed": "object change"})
        }
      })      
    }
  })
  return diffedchilds;
}

function buildAdminEmailHtml(arr) {
  var html = ""
  if (arr.length == 0) {
    // html += "No new or updated issues this week.<br/>"
    return null;
  } else {
    html += "This week the following users have created new issues:<br/>"
    html += "<ul>";
    arr.forEach(function(obj) {
      if (obj.changed == "added" ) {
        html += '<li><a href="https://the-tricktionarycom/contact?u=' + obj.user + '&i=' + obj.key + '">' + obj.value.name + ' - ' + obj.value.type + '</a></li>';
      }
    })
    html += "</ul>"
    html += "The following users has modified issues:<br/>"
    html += "<ul>"
    arr.forEach(function(obj) {
      if (obj.changed == "object change") {
        html += '<li><a href="https://the-tricktionarycom/contact?u=' + obj.user + '">' + obj.value.name + ' - ' + obj.value.type + '</a></li>';
        sendUserEmail(obj);
      }
    })
  }
  html += "</ul>"
  return html;
}

function sendUserEmail(issue) {
  if(issue.value.email) {
    var html = ""
    html += "Hello,<br/>You have recieved updates (most certainly replies) to one of the issues you created on the Tricktionary:<br/>"
    html += '<a href="https://the-tricktionary.com/contact?i=' + issue.key + '">' + issue.value.type + ' - ' + substring(issue.value.desc) + '</a><br/>'
    html += "Thank you for using the tricktionary<br/><br/>"
    html += '<a href="https://the-tricktionary.com/contact?unsub=' + issue.key + '">Unsubscribe from email updates on this issue</a>'
    var emailData = {
      from:    "the Tricktionary <noreply@" + mailgunConf.domain + ">",
      to:      issue.value.email,
      subject: "Updates to one of your issues on the Tricktionary",
      html:    html
    }
    mailgun.messages().send(emailData, function(err, body) {
      if (err) throw err;
      dlog("email to user sent");
    }
  }
}

// create db reference to contacts
var db  = admin.database();
var ref = db.ref("/contact");

ref.on("value", function(data) {
  if (!init) {
    var diff = objectdiff.diff(last, data.val());
    var checked = checker(diff);
    var changed = checker1(diff, checked);
    // send email
    var emailData = {
      from:    "the Tricktionary <noreply@" + mailgunConf.domain + ">",
      to:      mailgunConf.to,
      subject: "Daily contact summary " + moment().format("YYYY-MM-DD"),
      html:    buildAdminEmailHtml(changed)
    };
    if(emailData.html !== null) {
      mailgun.messages().send(emailData, function(err, body) {
        if (err) throw err;
        dlog("mail sent");
        fs.writeFile('./email-data/last.json', JSON.stringify(data.val()), function(err) {
          if (err) throw err;
          dlog("last.json written");
          console.log("success");
          process.exit();
        });
      });
    }
  } else {
    fs.writeFile('./email-data/last.json', JSON.stringify(data.val()), function(err) {
      if (err) throw err;
      dlog("last.json written");
      process.exit();
    }); 
  }
})

// or use on("child_added") and run as daemon and save to weekly file and send on mondays

setTimeout(function() {
  console.log("timed out");
  process.exit();
}, 240000);
