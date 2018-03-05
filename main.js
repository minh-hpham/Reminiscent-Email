const electron = require('electron')

const app = electron.app

const BrowserWindow = electron.BrowserWindow

var path = require('path')
var url = require('url')

const ipcMain = electron.ipcMain
const isOnline = require('is-online')
let checkIsOnlineInterval
let currentOnlineStatus


let mainWindow

let splashWindow

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 320,
        height: 240,
        frame: false,
        resizable: false,
        backgroundColor: '#FFF',
        alwaysOnTop: true,
        show: false
    })
    splashWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app/splash.html'),
        protocol: 'file',
        slashes: true
    }))
    splashWindow.on('closed', () => {
        splashWindow = null
    })
    splashWindow.once('ready-to-show', () => {
        splashWindow.show()
        createWindow()
    })
}

app.on('ready', createSplashWindow)

function createWindow () {
    mainWindow = new BrowserWindow( {
        show : false,
        center : true,
        width : 600,
        height : 800,
        icon: path.join(__dirname, 'app/assets/icons/png/Capture.PNG_64x64.png'),
//        frame : false,
    })
    mainWindow.loadURL(path.join(__dirname, 'app/index.html'))
//    mainWindow.loadURL('index.html')

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    startCheckingOnlineStatus()
}


//app.on('ready', function() {
//    createWindow()
//})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
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
})

ipcMain.on('app-init', event => {
    if (splashWindow) {
        setTimeout(() => {splashWindow.close()}, 2000)
    }
    mainWindow.show()
})
