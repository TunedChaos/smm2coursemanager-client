const {ipcRenderer} = require('electron')
var remote = require('electron').remote
var shell = require('electron').shell

document.getElementById('versionNumber').innerHTML = remote.app.getVersion();

function closeAboutWindow(){
    ipcRenderer.send('closeAboutWindow')
}

function openBrowserWindow(address){
    shell.openExternal(address)
}