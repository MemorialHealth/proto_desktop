"use strict"

const electron = require('electron');
const path = require('path');
const debugMenu = require('debug-menu');
const ActiveDirectory = require('activedirectory');

var user = 'MMHAD\\USERNAME';
var pass = 'USERPASS';

const config = {
    url: 'LDAP://10.168.10.83:389',
    baseDN: 'DC=mmhad,DC=mmhospital,DC=org',
    username: user,
    password: pass
}
const ad = new ActiveDirectory(config)
var env = process.env;
var _domain = process.env.USERDOMAIN;
var _user = process.env.USERNAME;
ad.authenticate(user, pass, function(err, auth){
    if(err){
        return console.log(err);
    }

    console.log(auth);
});

// Module to control application life
// const app = electron.app;

// Module to control menu bar (File, Edit, View, etc.,)
// const Menu = electron.Menu;

// Module to deal with system tray
// const Tray = electron.Tray;


// Can use destructuring to cleanly set our variables...much better than the above
const { app, clipboard, Menu, Tray, shell, dialog, globalShortcut} = electron;

// Module to create native browser window
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let mainWindow;
let tray;
function createWindow(){
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 960,
        height: 600
        , transparent:true
        // , frame: false
        , fullscreenable: true
    });

    // Load in our index.html of the app
    mainWindow.loadURL(`file://${__dirname}/src/index.html`);

    // Emitted when the window is closed.
    mainWindow.on('closed', function(){
        // Dereference the window object, usually you would store windows
        // in an array if you app supports multi-windows, this is the time 
        // when you should delete the corresponding element
        mainWindow = null;
    });
    
    const _name = electron.app.getName();

    tray = new Tray(path.join(__dirname, 'src', 'trayIcon.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: `About ${_name}`
        },
        {
            label: 'View Reports',
            click: _ => {
                shell.openExternal('https://public.tableau.com/views/LasbancadasdelCongreso/Congreso?:embed=y&:loadOrderID=0&:display_count=yes')
            }
        },
        {
            label: 'Notifications'
        },
        {
            label: 'Quit',
            click: _ => { app.quit() }
        }
    ]);
    tray.setToolTip('Decision Support #FTW');
    tray.setContextMenu(contextMenu);
    
    
    const menu = Menu.buildFromTemplate([
    {
        label: _name,
        role: 'menu',
        submenu: [
            {
                label: `About ${_name}`,
                click: _ => {
                    console.log('clicked about')
                },
                role: 'about'
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                click: _ => { app.quit() },
                accelerator: 'Cmd+Q'
            }
        ]
    },
    {
        label: 'Utility',
        submenu: [
            {
                label: 'Upload..',
                click: _ => {
                    dialog.showOpenDialog({
                        properties: ['openFile', 'openDirectory']
                    }, function(files){
                        
                    })
                }
            },
            {
                label: 'Launch..',
                click: _ => {
                    var child = require('child_process').execFile;
                    child('start winword', function(err, data){
                        
                    });
                }
            }
        ]
    },
    {
        label: 'Debug',
        submenu: debugMenu.windowDebugMenu(mainWindow)
    }]);

    if (process.platform !== 'darwin') {
        mainWindow.setMenu(menu);
    } else {
        electron.Menu.setApplicationMenu(menu);
    }


    mainWindow.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        shell.openExternal(url);
    });

    var _fullScreen = false;
    globalShortcut.register('F11', () => {
        if(_fullScreen){
            mainWindow.unmaximize();
        }else{
            mainWindow.maximize();
        }
        _fullScreen = !_fullScreen;
    });
}

// This method will be called when Electron has finished
// initialization and is read to create the browser windows.
// Some APIs can only be used after this even occurs
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', function(){
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicityly with Cmd + Q
    if( process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('activate', function(){
    // On OS X it is common to re-create a window in the app when the 
    // dock icon is clicked and there are no other windows open
    if(mainWindow === null)
        createWindow();
});
