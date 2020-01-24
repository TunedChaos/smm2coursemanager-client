const {app, BrowserWindow, Menu, BrowserView, dialog} = require('electron')
const Store = require('electron-store')

const ipc = require('electron').ipcMain
const path = require('path')
const enableSMM2Debug = false


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
var iconString = ''

if(process.platform === 'win32')
  iconString = 'src/images/icons/favicon.ico'
else if(process.platform === 'darwin')
  iconString = 'src/images/icons/favicon.icns'
else
  iconString = 'src/images/icons/favicon.png'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit()
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let childWindow
let childView
let aboutWindow

function createWindows () {
  var hasConfig = false
  if(typeof keyStore.get('keyCode') === 'undefined'){
    hasConfig = false
  }else if(typeof store.get('authCode') === 'undefined'){
    hasConfig = false
  }else if(typeof store.get('serverAddress') === 'undefined'){
    hasConfig = false
  }else{
    hasConfig = true
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 960,
    icon: iconString,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    show: false
  })
  // Build the main menu
  var closeOption = ''
  if(process.platform === 'darwin'){
    closeOption = '&Quit'
    acceleratorOption = 'Cmd+Q'
  }else{
    closeOption = 'E&xit'
  }
  var menu = Menu.buildFromTemplate([
    {
      label: '&File',
        submenu: [
          {
            label: '&Reload',
            click(){
              childWindow.reload()
              mainWindow.reload()
            },
            accelerator: 'CmdOrCtrl+R'
          },
          {
            label: '&Preferences',
            click(){
              showPreferenceWindow()
            },
            accelerator: 'CmdOrCtrl+P'
          },
          { type: 'separator' },
          {
            label: closeOption,
            click() {
              app.quit()
            }
          }
        ],
    },
    {
    label: '&Help',
        submenu: [
          {
            label: '&About',
            click() {
              showAboutWindow()
            }
          }
        ]
      }
  ])
  mainWindow.setMenu(menu)

  aboutWindow = new BrowserWindow({
    alwaysOnTop: true,
    parent: mainWindow,
    width: 460,
    height: 320,
    title: 'About Super Mario Maker 2 Course Manager',
    icon: iconString,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    resizable: false,
    minimizable: false,
    show: false,
  })

  aboutWindow.on('close', function(event){
    event.preventDefault()
    aboutWindow.hide()
    mainWindow.setEnabled(true)
    childWindow.setEnabled(true)
  })

  aboutWindow.on('closed', function(event){
    aboutWindow = null
  })

  preferenceWindow = new BrowserWindow({
    parent: mainWindow,
    width: 320,
    height: 250,
    title: 'Super Mario Maker 2 Course Manager Preferences',
    icon: iconString,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    resizable: false,
    minimizable: false,
    show: false,
    closable: false
  })
  preferenceWindow.on('close', function(event){
    event.preventDefault()
  })

  preferenceWindow.on('closed', function(event){
    preferenceWindow = null
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  if(enableSMM2Debug)
  {
    childWindow = new BrowserWindow({
      title: 'SMM2_StatusBar',
      width: 800,
      height: 112,
      parent: mainWindow,
      useContentSize: true,
      icon: iconString,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true
      },
      frame: true
    })
    mainWindow.webContents.openDevTools()
    childWindow.webContents.openDevTools()
    aboutWindow.webContents.openDevTools()
    preferenceWindow.webContents.openDevTools()
  }else{
    childWindow = new BrowserWindow({
      title: 'SMM2_StatusBar',
      width: 800,
      height: 112,
      parent: mainWindow,
      useContentSize: true,
      icon: iconString,
      webPreferences: {
        nodeIntegration: true,
        affinity: "window"
      },
      backgroundColor: "#1e1e1e",
      frame: false,
      show: false,
      resizable: false
    })
    childWindow.removeMenu()
    aboutWindow.removeMenu()
    preferenceWindow.removeMenu()
  }

  if(!enableSMM2Debug)
  {
    childView = new BrowserView()
    childWindow.setBrowserView(childView)
    childView.setBounds({ x: 0, y: 56, width: 800, height: 56 })
    childView.setBackgroundColor("#1e1e1e")
    childWindow.setBackgroundColor = "#1e1e1e"
  }

  loadingScreen = new BrowserWindow({
    alwaysOnTop: true,
    width: 460,
    height: 420,
    title: 'Loading Super Mario Maker 2 Course Manager',
    icon: iconString,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    },
    resizable: false,
    minimizable: false,
    show: true,
    frame: false,
    show: false
  })

  loadingScreen.on('closed', function () {
    loadingScreen = null
  })

  // and load the index.html of the app.
  mainWindow.loadFile('src/index.html')
  childWindow.loadFile('src/statusbar.html')
  aboutWindow.loadFile('src/about.html')
  preferenceWindow.loadFile('src/preferences.html')
  loadingScreen.loadFile('src/loading.html')

  if(!hasConfig){
    preferenceWindow.once('ready-to-show', () => {
      preferenceWindow.show()
    })
  }else if(hasConfig){
    childView.webContents.loadURL(store.get('serverAddress'))
    loadingScreen.once('ready-to-show', () => {
      loadingScreen.show()
    })
    mainWindow.once('ready-to-show', () => {
      loadingScreen.close()
      mainWindow.show()
    })
  }


  mainWindow.on('close', function() {
    loadingScreen = null
    childView = null
    childWindow = null
    preferenceWindow = null
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  childWindow.on('close', function(event) {
    event.preventDefault()
  })

  childWindow.on('closed', function() {
    childWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindows)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
require('dotenv').config({path: path.resolve(__dirname+'/.env')})

ipc.on('getAuthCode', function(event) {
  event.reply('authCode', store.get('authCode'))
})

ipc.on('updateStatusBar', function(event){
  childWindow.webContents.send('updateBar')
})

global.sharedSettings = {
  serverAddress: store.get('serverAddress'),
  authCode: store.get('authCode')
}

ipc.on('hideStatusBar', function(event){
  childWindow.hide()
})

ipc.on('showStatusBar', function(event){
  childWindow.show()
})

function showAboutWindow(){
  aboutWindow.show()
  mainWindow.setEnabled(false)
  childWindow.setEnabled(false)
}

ipc.on('closeAboutWindow', function(event){
  aboutWindow.hide()
  mainWindow.setEnabled(true)
  childWindow.setEnabled(true)
})


function showPreferenceWindow(){
  preferenceWindow.show()
  mainWindow.setEnabled(false)
  childWindow.setEnabled(false)
}

ipc.on('closePreferenceWindow', function(event, encryptKey, authenticationCode, servAddr){
  keyStore.set('keyCode', encryptKey)

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
      encryptionKey: encryptKey
  })
  store.set('authCode', authenticationCode)
  store.set('serverAddress', servAddr)

  global.sharedSettings = {
    serverAddress: servAddr,
    authCode: authenticationCode
  }
  childView.webContents.loadURL(store.get('serverAddress'))
  mainWindow.setEnabled(true)
  childWindow.setEnabled(true)
  childWindow.reload()
  mainWindow.reload()
  aboutWindow.reload()
  preferenceWindow.hide()
  if(loadingScreen !== null)
  {
    loadingScreen.once('ready-to-show', () => {
      loadingScreen.show()
    })
  }
  mainWindow.once('ready-to-show', () => {
    if(loadingScreen !== null)
    {
      loadingScreen.close()
    }
    mainWindow.show()
  })
})