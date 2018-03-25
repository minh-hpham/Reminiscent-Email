const electron = require('electron');

const app = electron.app;

const BrowserWindow = electron.BrowserWindow;

var path = require('path');
var url = require('url');

var fs = require('fs');

const ipcMain = electron.ipcMain
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

const isOnline = require('is-online')
let checkIsOnlineInterval
let currentOnlineStatus


let mainWindow

//let splashWindow
//
//function createSplashWindow() {
//    splashWindow = new BrowserWindow({
//        width: 320,
//        height: 240,
//        frame: false,
//        resizable: false,
//        backgroundColor: '#FFF',
//        alwaysOnTop: true,
//        show: false
//    })
//    splashWindow.loadURL(url.format({
//        pathname: path.join(__dirname, 'app/splash.html'),
//        protocol: 'file',
//        slashes: true
//    }))
//    splashWindow.on('closed', () => {
//        splashWindow = null
//    })
//    splashWindow.once('ready-to-show', () => {
//        splashWindow.show()
//        createWindow()
//    })
//}


function createWindow () {
    mainWindow = new BrowserWindow( {
//        backgroundColor: '#002b36',
        show : false,
        center : true,
        width : 1024,
        height : 600,
//        frame: false,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png')
//        icon: path.join(__dirname,'app/images/letter.PNG_256x256.png')
    })

    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            mainWindow.loadURL(path.join(__dirname, 'index.html'))
        } else {
            mainWindow.loadURL(path.join(__dirname, 'email.html'))
        }
    });

//    mainWindow.loadURL(path.join(__dirname, 'app/index.html'))

    // Open the DevTools.
//    mainWindow.webContents.openDevTools()

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    })

    mainWindow.on('closed', function () {
        mainWindow = null
    })

//    startCheckingOnlineStatus()
}

//app.on('ready', createSplashWindow)
app.on('ready', function() {
//    createSplashWindow();
    createWindow();
})

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

ipcMain.on('check-online-status', checkIsOnline )

//SPLASH WINDOW: REQUEST FOR VERSION
ipcMain.on('get-version', event => {
    console.log('app version: ', app.getVersion())
    event.sender.send('set-version', app.getVersion())
//    mainWindow.webContents.send('set-version', app.getVersion());
})

ipcMain.on('app-init', event => {
    console.log(splashWindow != null)
    if (splashWindow) {
        setTimeout(() => {
            splashWindow.close()
            mainWindow.show()
        }, 2000)
    }
})
