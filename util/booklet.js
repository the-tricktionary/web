var admin   = require("firebase-admin");
var fs      = require("fs");
var moment  = require("moment");
var exec    = require("child_process").exec;
var storage = require('@google-cloud/storage');
var child;
var papersize;

var serviceAccount = require("./email-data/firebase-adminsdk.json");

if (process.argv.indexOf("test") !== -1) {
  function dlog(msg) { console.log(msg) }
  dlog("running in debug mode")
} else {
  function dlog(msg) { return true; }
}

if (process.argv.indexOf("letter") !== -1) {
  papersize = "letter"
} else {
  papersize = "a4"
}

// initialize firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project-5641153190345267944.firebaseio.com"
});

//initialize google cloud for storage
var gcs = storage({
  keyFilename: 'email-data/google-storageadmin.json',
});

dlog("init done");

// Get current datetime
var now = moment().format("YYYYMMDD-HHmmss");

var filename = "booklet-" + now + "-" + papersize;

dlog("creating " + filename);

// create db reference
var db  = admin.database();
var ref = db.ref("/");

//create storage reference
var bucket = gcs.bucket('project-5641153190345267944.appspot.com');

ref.on("value", function(snapshot) {
  dlog("data reciecved");
  var keys = [];
  var data = snapshot.val().tricks;
  var types = snapshot.val().tricktypes;

  // construct tex file contents
  var tex = "";
  tex += '\\documentclass[12pt]{article}\n'
  
  if (papersize == "letter" ) {
    tex += '\\usepackage[paperheight=5.5in,paperwidth=8.5in]{geometry}\n'
  } else {
    tex += '\\usepackage[a5paper]{geometry}\n'
  }

  tex += '\\usepackage{enumitem,amssymb,tabularx}\n'
  tex += '\\newlist{todolist}{itemize}{2}\n'
  tex += '\\setlist[todolist]{label=$\\square$,leftmargin=0pt,itemsep=0pt,parsep=0pt}\n'
  tex += '\\title{the Tricktionary}\n'
  tex += '\\author{}\n'
  tex += '\\begin{document}\n'
  tex += '\\clearpage\\maketitle\n'
  tex += '\\thispagestyle{empty}\n'
  tex += '\\vfill\n'
  tex += '\\begin{small}\n'
  tex += '\\noindent detailed information about tricks are \\\\\n'
  tex += 'avilable on the-tricktionary.com or \\\\\n'
  tex += 'in the Tricktionary\'s android app.\n'
  tex += '\\end{small}\n'
  tex += '\\pagebreak\n'

  // tricks
  var keys = Object.keys(data);
  keys.forEach(function(key) {
    leveltypes = {};

    tex += '\\section*{Level ' + data[key].level + '}\n'

    types.forEach(function(type) {
      Object.keys(data[key].subs).forEach(function(subKey) {
        if (data[key].subs[subKey].type == type) {
          if (!leveltypes[type]) {
            tex += '\\subsection*{' + type + '}\n'
            tex += '\\begin{todolist}\n'
            leveltypes[type] = true;
          }
          tex += '\\item ' + data[key].subs[subKey].name + '\n'
        }
      })
      if(leveltypes[type]) {
        tex += '\\end{todolist}\n'
      }
    })
    
    tex += '\\pagebreak\n'
  })

  // speed sheets
  for (var pages = 0; pages < 4; pages++) {
    tex += '\\section*{Speed event:  }\n'
    tex += '\\noindent \\begin{tabularx}{\\linewidth}{|X|X|}\n'
    tex += '\\hline\n'
    tex += 'Date & Count \\\\\n'
    tex += '\\hline\n'
    for (var lines = 0; lines < 26; lines++) {
      tex += ' & \\\\\n'
      tex += '\\hline\n'
    }
    tex += '\\end{tabularx}\n'
    if (pages !== 3) {
      tex += '\\pagebreak\n'
    }
    if (pages == 3) {
    tex += '\\vfill\n'
    tex += '\\begin{tiny}\n'
    tex += '\\copyright the Tricktionary 2016-' + moment().format('YYYY') + '\n'
    tex += '\\end{tiny}\n'
    }

  }

  tex += '\\end{document}\n'

  // tex for booklet version
  var bookletTex = "";
  bookletTex += '\\documentclass[12pt]{article}\n'

  if(papersize == "letter") {
    bookletTex += '\\usepackage[letterpaper]{geometry}\n'
  } else {
    bookletTex += '\\usepackage[a4paper]{geometry}\n'
  }

  bookletTex += '\\usepackage{pdfpages}\n'
  bookletTex += '\\includepdfset{pages=-}\n'
  bookletTex += '\\title{the Tricktionary}\n'
  bookletTex += '\\author{}\n'
  bookletTex += '\\begin{document}\n'
  bookletTex += '\\includepdf[pages=-,landscape,booklet=true]{booklets/raw-' + filename +'.pdf}\n'
  bookletTex += '\\end{document}\n'

  fs.writeFile('./booklets/raw-' + filename + '.tex', tex, function(err) {
    if (err) throw err;
    dlog("tex rawbooklet saved");
    fs.writeFile('./booklets/' + filename + '.tex', bookletTex, function(err) {
      if (err) throw err;
      dlog("tex booklet saved");
      dlog("generating booklet pdf")
      //exec pdflatex on raw
      child = exec("pdflatex -output-directory=booklets -synctex=1 -interaction=nonstopmode ./booklets/raw-" + filename + ".tex", function (error, stdout, stderr) {
        dlog('stdout: ' + stdout);
        dlog('stderr: ' + stderr);
        if (error !== null) {
          dlog('exec error: ' + error);
        }
        if (error === null) {
          dlog("rawbooklet pdf generated");
          dlog("generating booklet pdf");
          child2 = exec("pdflatex -output-directory=booklets -synctex=1 -interaction=nonstopmode ./booklets/" + filename + ".tex", function(error, stdout, stderr) {
            dlog('stdout: ' + stdout);
            dlog('stderr: ' + stderr);
            if (error !== null) {
              dlog('exec error: ' + error);
            }
            if (error === null) {
              dlog("booklet pdf generated");
              dlog("uploading booklet pdf to firebase storage")
              var options = {
                destination: 'booklets/' + filename + '.pdf'
              }
              bucket.upload('booklets/' + filename + '.pdf', options, function(err, file) {
                if(!err) {
                  dlog("booklet successfully uploaded");
                  dlog("saving filename to db");
                  db.ref("/booklets/latest/" + papersize).set("booklets/" + filename + ".pdf", function(error) { if(error) { proccess.exit(1);} else { dlog("filename for latest updated in db"); process.exit() }})
                }
              })
            }
          })
        }
      });
    });
  });
});

setTimeout(function() {
  console.log("booklet crration failed, timeout");
  process.exit(1);
}, 180000);

