var firebase = require("firebase");
var gcloud = require('gcloud')({ 
  projectId: 'project-5641153190345267944',
  keyFilename: '../../tricktionary-key.json'
});

// init storage
var gcs = gcloud.storage();
var bucket = gcs.bucket('project-5641153190345267944.appspot.com');
// init db
firebase.initializeApp({
  serviceAccount: "../../tricktionary-key.json",
  databaseURL: "https://project-5641153190345267944.firebaseio.com"
});

// get all data
var db = firebase.database();
var ref = db.ref("/");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});
