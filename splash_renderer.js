const { ipcRenderer } = require('electron')

ipcRenderer.on('set-version', (event, arg) => {
    console.log(arg)
    const versionSpan = document.getElementById('versionSpan')
    versionSpan.innerHTML = arg
})
ipcRenderer.send('get-version')

setTimeout(() => {ipcRenderer.send('app-init')}, 5000)
