const electron = require('electron');

const app = electron.app;

const dialog = electron.dialog;

const BrowserWindow = electron.BrowserWindow;

var path = require('path');
var url = require('url');

var fs = require('fs');

const ipcMain = electron.ipcMain
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

var MBOX_PATH = TOKEN_DIR + 'email.mbox';

const isOnline = require('is-online')
let checkIsOnlineInterval
let currentOnlineStatus


let mainWindow


function createWindow () {
    mainWindow = new BrowserWindow( {
//        backgroundColor: '#002b36',
        show : false,
        center : true,
        width : 1024,
        height : 600,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png')
    })

    if (path.extname(MBOX_PATH) == '.mbox') {
        mainWindow.loadURL(path.join(__dirname, 'email.html'))
    } else {
        mainWindow.loadURL(path.join(__dirname, 'index.html'))
    }

//    fs.readFile(TOKEN_PATH, function(err, token) {
//        if (err) {
//            mainWindow.loadURL(path.join(__dirname, 'index.html'))
//            dialog.showOpenDialog(mainWindow, {
//                properties: ['openDirectory']
//            })
//        } else {
//            mainWindow.loadURL(path.join(__dirname, 'email.html'))
//        }
//    });
    
    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    })

    mainWindow.on('closed', function () {
        mainWindow = null
    })

//    startCheckingOnlineStatus()
}

exports.selectEmailFile = function () {
    dialog.showOpenDialog(mainWindow, {
        properties : ['openFile'],
        filters : [ {name: 'Custom File Type', extensions: ['mbox']}]
    },function(filePaths) {
        if (filePaths === undefined) {
            console.log("No file selected");
            return
        } else {
            MBOX_PATH = filePaths[0];
        }
    })
}

app.on('ready', createWindow)


app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

function checkIsOnline() {
    isOnline().then( online => {
        console.log( "Online? " + online )
        mainWindow.webContents.send( 'update-online-status' , { online: online })
        if( currentOnlineStatus !== online ) {
            if (process.platform === 'darwin') {
                app.dock.bounce( 'informational' )
            }
        }
        currentOnlineStatus = online
    })
}
function startCheckingOnlineStatus() {
    checkIsOnlineInterval = setInterval(checkIsOnline, 10000 )
}

//ipcMain.on('check-online-status', checkIsOnline )


