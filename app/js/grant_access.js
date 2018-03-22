var $ = require('jquery');

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';


/**
* Open external link
*/
var shell = require('electron').shell;
$("#authUrl").on('click',function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
    $('.message').hide();
    $('#user-code').show();
});

// start when User clicks on Sign In with Google Account
function signin() {
    fs.readFile('app/assets/credentials/client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Gmail API.
        authorize(JSON.parse(content));
    });
}

function view() {
     fs.readFile('app/assets/credentials/client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Gmail API.
        var credentials = JSON.parse(content);
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            console.log("HELLO YOU DON'T HAVE TOKEN")
//            getNewToken(oauth2Client);
        }
            else {
                oauth2Client.credentials = JSON.parse(token);
                searchSubject(oauth2Client);
            }
        });
    });
}

/**
* Create an OAuth2 client with the given credentials, and then execute the given callback function.
*/
function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
        getNewToken(oauth2Client);
    }
//    else {
//        oauth2Client.credentials = JSON.parse(token);
////        callback(oauth2Client);
//    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 */
function getNewToken(oauth2Client) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    
    $('#signin-btn').attr('style', 'display: none');
//    $("#authUrl").text(authUrl); 
    $("#authUrl").attr("href", authUrl);
    $('.message').show();
    
    $("#user-code").on("keyup", function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            var code = $("#user-code").val();
            oauth2Client.getToken(code, function(err, token) {
              if (err) {
                alert('Error while trying to retrieve access token', err);
                return;
              }
//              oauth2Client.credentials = token;
              storeToken(token);
//              callback(oauth2Client);
              location.assign('email.html');
            });
        }
    })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function searchSubject(auth) {
    var gmail = google.gmail({
        version: 'v1',
        auth : auth
    });
    gmail.users.messages.list({
        userId: 'me',
        maxResults: 10,
        q: "{subject:congrats subject:congratulations}",
    }, function(err,response) {
        if (err) {
            console.log('The API returned an error: ' + err);
          return;
        }
        var messages = response.messages;
        if (messages.length == 0) {
          console.log('No messages found.');
        } else {
          console.log('Messages:');
          for (var i = 0; i < messages.length; i++) {
            var message_id = messages[i].id;
            getMessage(gmail,message_id);
          }
        }
    })
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
        var message = response;
        console.log(' - Snippet: %s', response.snippet);
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
