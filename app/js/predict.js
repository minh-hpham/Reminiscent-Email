var $ = require('jquery');

var fs = require('fs');

var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

function view() {
    // Load client secrets from a local file.
    fs.readFile('app/assets/credentials/client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the
      // Gmail API.
      authorize(JSON.parse(content), searchSubject);
    });
}

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
        console.log("API error: " + err);
        return;
    } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
    }
  });
}

//function view() {
//     fs.readFile('app/assets/credentials/client_secret.json', function processClientSecrets(err, content) {
//        if (err) {
//            console.log('Error loading client secret file: ' + err);
//            return;
//        }
//        // Authorize a client with the loaded credentials, then call the
//        // Gmail API.
//        var credentials = JSON.parse(content);
//        var clientSecret = credentials.installed.client_secret;
//        var clientId = credentials.installed.client_id;
//        var redirectUrl = credentials.installed.redirect_uris[0];
//        var auth = new googleAuth();
//        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
//
//        // Check if we have previously stored a token.
//        fs.readFile(TOKEN_PATH, function(err, token) {
//        if (err) {
//            console.log("HELLO YOU DON'T HAVE TOKEN")
////            getNewToken(oauth2Client);
//        }
//            else {
//                oauth2Client.credentials = JSON.parse(token);
//                searchSubject(oauth2Client);
//            }
//        });
//    });
//}

function searchSubject(auth) {
    var gmail = google.gmail({
        version: 'v1',
        auth : auth
    });
    gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: "{subject:congrats}",
    }, function(err,response) {
        if (err) {
            console.log('The API returned an error: ' + err);
          return;
        }
        var messages = response.messages;
        if (messages.length == 0) {
          console.log('No messages found.');
        } else {
            storeMessages(gmail,messages);
//          console.log('Messages:');
//          for (var i = 0; i < messages.length; i++) {
//            var message_id = messages[i].id;
//            getMessage(gmail,message_id);
//          }
        }
    })
}

function storeMessages(gmail,messages) {
    var MESSAGE_DIR = TOKEN_DIR + '/messages/';
    var MESSAGE_PATH = MESSAGE_DIR + 'messages.json';
    try {
        fs.mkdirSync(MESSAGE_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
          throw err;
        }
    }
    var logger = fs.createWriteStream(MESSAGE_PATH, {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })

    for (var i = 0; i < messages.length; i++) {
        var message_id = messages[i].id;
        gmail.users.messages.get({
                id: message_id,
                userId: 'me',
            }, function(err,response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                  return;
                }
                console.log(' - Snippet: %s', response.snippet);
                var data = response;
                logger.write(JSON.stringify(data));
        })
//        var data = getMessage(gmail,message_id);
//        logger.write(JSON.stringify(data));
    }
    logger.on('finish',() => {
        console.log('Messages stored to ' + TOKEN_PATH);
    });
//    logger.end();
}
function getMessage(gmail,message_id) {
    gmail.users.messages.get({
        id: message_id,
        userId: 'me',
    }, function(err,response) {
        if (err) {
            console.log('The API returned an error: ' + err);
          return;
        }
        console.log(' - Snippet: %s', response.snippet);
        return response;
    })
}

function listLabels(auth) {
    var gmail = google.gmail('v1');
    gmail.users.labels.list({
        auth: auth,
        userId: 'me',
    }, function(err, response) {
        if (err) {
          console.log('The API returned an error: ' + err);
          return;
        }
        var labels = response.labels;
        if (labels.length == 0) {
          console.log('No labels found.');
        } else {
          console.log('Labels:');
          for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            console.log('- %s', label.name);
          }
        }
    });
}
