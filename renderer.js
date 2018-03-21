const { ipcRenderer } = require('electron')

//setTimeout(() => {ipcRenderer.send('app-init')}, 5000)

let onlineStatus

const updateOnlineStatus = ( event, status ) => {
    if( status.online ) {
        console.log("ONLINE")
    } else {
        console.log("OFFLINE")
    }
    if( this.onlineStatus !== undefined && this.onlineStatus !== status.online ) {
        let note = new Notification('You are ' + (status.online ? 'online' : 'offline'),
                                    { body: 'You are now ' + (status.online ? 'online' : 'offline')})
        note.onclick = () => {
            console.log( 'Notification clicked!' )
        }
    }
    this.onlineStatus = status.online
}

const checkOnlineStatus = () => {
    ipcRenderer.send('check-online-status')
}

ipcRenderer.on('update-online-status', updateOnlineStatus )

window.addEventListener( 'online', checkOnlineStatus )
window.addEventListener( 'offline', checkOnlineStatus )
//checkOnlineStatus()
