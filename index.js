const express = require("express")
const app = express();
const async = require('async')
var bodyParser = require('body-parser');
var path = require('path');
const port = 3000;
// const fs = require('fs');
// const readline = require('readline');
// const {google} = require('googleapis');
// const credentials = require('./credentials.json');
// var auth
app.use(express.static(path.join(__dirname+'/public')))

// app.get('/', function (req, res) {
//   res.send("hello");
// })

app.get('/index.html', function (req, res) {
  res.sendFile( path.join(__dirname + "/public/index.html") );
})
app.get('/', function (req, res) {
  res.send("hello");
})

// const scopes = [
//   "https://www.googleapis.com/auth/drive",
//   "https://www.googleapis.com/auth/drive.file",
//   "https://www.googleapis.com/auth/drive.readonly",
//   "https://www.googleapis.com/auth/drive.metadata.readonly",
//   "https://www.googleapis.com/auth/drive.appdata",
//   "https://www.googleapis.com/auth/drive.metadata",
//   "https://www.googleapis.com/auth/drive.photos.readonly"
// ];
// function authorize(credentials) {
//   console.log("credentials",credentials)
//   const {client_secret, client_id, redirect_uris} = credentials.installed;
//   console.log("secret",client_secret)
//   auth = new google.auth.OAuth2(
//       client_id, client_secret, redirect_uris[0]);
// }

// fs.readFile('credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Drive API.
//   authorize(JSON.parse(content));
// });



// const drive = google.drive({ version: "v3", auth });

// drive.files.list({}, (err, res) => {
//   if (err) throw err;
//   const files = res.data.files;
//   if (files.length) {
//   files.map((file) => {
//     console.log(file);
//   });
//   } else {
//     console.log('No files found');
//   }
// });

// var fileId = '1fw6Bd3SXIdYKxX_Es8qeZHE_2gSmeQi5';
// // var dest = fs.createWriteStream('/Gwalior fort/photo.jpg');
// var link = drive.files.get({
//   fileId: fileId,
//   alt: 'media'
// })
//     .on('end', function () {
//       console.log('Done');
//     })
//     .on('error', function (err) {
//       console.log('Error during download', err);
//     })
//     .then((data)=>{
//       console.log("data",data)
//     })
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [ "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.metadata",
  "https://www.googleapis.com/auth/drive.photos.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
//   var fileId = '1fw6Bd3SXIdYKxX_Es8qeZHE_2gSmeQi5';
  var data =[];
  var pageToken = null;
// Using the NPM module 'async'
async.doWhilst(function (callback) {
  drive.files.list({
    q: "'130Qky-7YRK1hpccueRwHLODVoiu78S8p' in parents",
    fields: 'nextPageToken, files(id, name)',
    spaces: 'drive',
    pageToken: pageToken
  }, function (err, res) {
    if (err) {
      // Handle error
      console.error(err);
      callback(err)
    } else {
      // res.data.files.forEach(function (file) {
      //   console.log('Found file: ', file.name, file.id);
      //   data.push(file)
      // });
      // console.log(res.data.files)
      data= [...res.data.files]
      // console.log(data)
      pageToken = res.nextPageToken;
      callback();
    }
  });
}, function () {
  return !!pageToken;
}, function (err) {
  if (err) {
    // Handle error
    console.error(err);
  } else {
    // All pages fetched
    // console.log(data)
  }
})
console.log(data)
}

app.listen(port, () => {
  console.log(`hello`);
});
