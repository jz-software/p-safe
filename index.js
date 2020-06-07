const dataset = require('./storage/passwords.json')
const Storage = require('./src/Storage')

function findWithAttr(array, attr, value) {
    for(var i = 0; i < array.length; i += 1) {
        if(array[i][attr] === value) {
            return i;
        }
    }
    return -1;
}
function findService(service){
    const serviceIndex = findWithAttr(dataset, "service", service);
    return serviceIndex;
}

const storage = new Storage();
const mainPassword = "ShrekSensei33";

// Storage interaction
//storage.savePassword(dataset, "GitHub", "passwordToStore", "mainPassword");
//storage.removePassword(dataset, findService("GitHub"));
//storage.changePassword(dataset, findService("GitHub"), "newPassword", "mainPassword");

const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    mainWindow.on('closed', function(){
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Password',
        webPreferences: {
            nodeIntegration: true
        }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    addWindow.on('close', function(){
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('password:add', function(e, item){
    //mainWindow.webContents.send('password:add', item);
    addWindow.close();
    console.log(item)
    storage.savePassword(dataset, item.service, item.password, mainPassword);
    updateWindow();
});

// Update window
function updateWindow(){
    mainWindow.webContents.send('password:update', storage.decryptAll(dataset));
}

const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Add',
                click(){
                    createAddWindow();
                }
            },
            {    
                label: 'Change'
            },
            {
                label: 'Delete'
            }    
        ]
    }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Dev tools',
        submenu: [
            {
                label: 'Toggle Devtools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            },
            {
                label: 'Update',
                click(item, focusedWindow){
                    updateWindow();
                }
            },
        ]
    })
}