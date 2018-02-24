const electron = require('electron')

const app = electron.app

const BrowserWindow = electron.BrowserWindow

var path = require('path')

let mainWindow

function createWindow () {
    mainWindow = new BrowserWindow( {
        width : 600,
        height : 800,
//        backgroundColor : '#312450',
        icon: path.join(__dirname, 'app/assets/icons/png/Capture.PNG_64x64.png')
    })
    mainWindow.loadURL(path.join(__dirname, 'app/index.html'))
//    mainWindow.loadURL('index.html')

    mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready',createWindow)

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
