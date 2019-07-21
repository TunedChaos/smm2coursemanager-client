const {ipcRenderer} = require('electron')
const dialog = require('electron').remote.dialog
var shell = require('electron').shell
const Store = require('electron-store')

const keyStore = new Store({
    name:'keyStore',
    keyCode: {
        type: 'string',
        maximum: 100,
        minimum: 12
    }
})
const store = new Store({
    authCode: {
        type: 'string',
        maximum: 100,
        minimum: 12,
    },
    serverAddress: {
        type: 'string',
        format: 'url'
    },
    encryptionKey: keyStore.get('keyCode')
})

var encryptKeyInput = document.getElementById("encryptionKey")
var authCodeInput = document.getElementById("authCode")
var serverAddressInput = document.getElementById("serverAddress")
var okButton = document.getElementById("OKButton")

if(typeof keyStore.get('keyCode') !== 'undefined')
{
    document.getElementById("encryptionKey").value = keyStore.get('keyCode')
}
if(typeof store.get('authCode') !== 'undefined')
{
    document.getElementById("authCode").value = store.get('authCode')
}
if(typeof store.get('serverAddress') !== 'undefined')
{
    document.getElementById("serverAddress").value = store.get('serverAddress')
}

function closePreferenceWindow(){
    var encryptKey = document.getElementById("encryptionKey").value
    var authCode = document.getElementById("authCode").value
    var serverAddress = document.getElementById("serverAddress").value
    var urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.?[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gmi
    if(encryptKey === '')
    {
        dialog.showMessageBox(null,
            {
                'title': 'No Encryption Key',
                'type': 'error',
                'alwaysOnTop': true,
                'message': 'Please enter an encryption key'
            }
        )
        encryptKeyInput.focus()
        encryptKeyInput.select()
        authCodeInput.blur()
        serverAddressInput.blur()
        okButton.blur()
    }else if(encryptKey.length <= 11){
        dialog.showMessageBox(null,
            {
                'title': 'Encryption Key Too Short',
                'type': 'error',
                'alwaysOnTop': true,
                'message': 'Your encryption key must be 12 or more characters'
            }
        )
        encryptKeyInput.focus()
        encryptKeyInput.select()
        authCodeInput.blur()
        serverAddressInput.blur()
        okButton.blur()
    }else if(authCode === ''){
        dialog.showMessageBox(null,
            {
                'title': 'No Authentication Code',
                'type': 'error',
                'alwaysOnTop': true,
                'message': 'Please enter an authentication code.'
            }
        )
        encryptKeyInput.blur()
        authCodeInput.focus()
        authCodeInput.select()
        serverAddressInput.blur()
        okButton.blur()
    }else if(authCode.length <= 11){
        dialog.showMessageBox(null,
            {
                'title': 'Authentication Code Too Short',
                'type': 'error',
                'alwaysOnTop': true,
                'message': 'Your authentication code must be 12 or more characters'
            }
        )
        encryptKeyInput.blur()
        authCodeInput.focus()
        authCodeInput.select()
        serverAddressInput.blur()
        okButton.blur()
    }
    else if(serverAddress === '')
    {
        dialog.showMessageBox(null,
            {
                'title': 'No Server Address',
                'type': 'error',
                'alwaysOnTop': true,
                'message': 'Please enter a server address'
            }
        )
        encryptKeyInput.blur()
        authCodeInput.blur()
        serverAddressInput.focus()
        serverAddressInput.select()
        okButton.blur()
    }
    else if(!serverAddress.includes('http'))
    {
        dialog.showMessageBox(null,
            {
                'title': 'Invalid Protocol',
                'type': 'error',
                'alwaysOnTop': true,
                'message': 'Server Address must include http:// or https://'
            }
        )
        encryptKeyInput.blur()
        authCodeInput.blur()
        serverAddressInput.focus()
        serverAddressInput.select()
        okButton.blur()
    }
    else if(serverAddress.match(urlRegex) === null)
    {
        dialog.showMessageBox(null,
            {
                'title': 'Invalid Server Address',
                'type': 'error',
                'alwaysOnTop': true,
                'message': 'Invalid URL Entered for Server Address'
            }
        )
        encryptKeyInput.blur()
        authCodeInput.blur()
        serverAddressInput.focus()
        serverAddressInput.select()
        okButton.blur()
    }
    else
    {
        ipcRenderer.send('closePreferenceWindow', encryptKey, authCode, serverAddress)
    }
}

function openBrowserWindow(address){
    shell.openExternal(address)
}

var formObjectNodes = document.getElementsByTagName("INPUT")
var formObjects = Array.prototype.slice.call(formObjectNodes)
formObjects.push = document.getElementsByTagName("BUTTON")[0]
formObjects.forEach(formObject => {
    formObject.addEventListener("keyup", function(event) {
        if( event.keyCode === 13){
            closePreferenceWindow()
        }
    })
})