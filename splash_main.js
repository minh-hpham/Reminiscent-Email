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
        pathname: path.join(__dirname, 'splash.html'),
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


app.on('ready', function() {
    createSplashWindow();
//    createWindow();
})

//SPLASH WINDOW: REQUEST FOR VERSION
ipcMain.on('get-version', event => {
    event.sender.send('set-version', app.getVersion())
})

ipcMain.on('app-init', event => {
    console.log(splashWindow != null)
    if (splashWindow) {
        setTimeout(() => {
            splashWindow.close()
            mainWindow.show()
        }, 5000)
    }
})