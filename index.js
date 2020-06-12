let rawDataset = require('./storage/passwords.json')
const Storage = require('./src/Storage')

const storage = new Storage();
let dataset;

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

let mainPassword = "";
storage.findUser();

// Storage interaction
//storage.savePassword(dataset, "GitHub", "passwordToStore", "mainPassword");
//storage.removePassword(dataset, findService("GitHub"));
//storage.changePassword(dataset, findService("GitHub"), "newPassword", "mainPassword");

const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

let mainWindow;
let addWindow;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'loginWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    mainWindow.on('closed', function(){
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

// Catch item:add
ipcMain.on('password:add', function(e, item){
    //mainWindow.webContents.send('password:add', item);
    storage.savePassword(dataset, item.service, item.login, item.password, item.icon ,mainPassword);
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));
});
// Catch item:add
ipcMain.on('password:delete', function(e, item){
    console.log("Password deleted")
    storage.removePassword(dataset, item.index);
    updateWindow();
});
ipcMain.on('password:update', function(e){
    updateWindow();
});
ipcMain.on('user:login', function(e, item){
    const auth = storage.validateUser(item.login, item.password);
    if(auth==true){
        dataset = rawDataset[storage.findUser('user', item.login)].passwords;
        rawDataset = null;
        storage.user = item.login;
        mainPassword = item.password; 
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'mainWindow.html'),
            protocol: 'file',
            slashes: true
        }));
    }
    else{
        mainWindow.webContents.send('user:login:wrong', "hi");
    }
});
ipcMain.on('user:register', function(e, item){
    storage.createUser(item.login, item.email, item.password)
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'loginWindow.html'),
        protocol: 'file',
        slashes: true
    }));
});
ipcMain.on('user:checkLogin', function(e, item){
    const allUsers = storage.getAllUsers();
    let output = false;

    for(let i=0; i<allUsers.length; i++){
        if(allUsers[i]==item.username){
            output = true;
        }
    }
    if(output==true){
        mainWindow.webContents.send('user:valid');
    }  
    else{
        mainWindow.webContents.send('user:wrong');
    }  
});
ipcMain.on('user:info', function(e){
    mainWindow.webContents.send('user:infosent', storage.user);
});   

// Main Page
ipcMain.on('password:create', function(e){
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'createPassword.html'),
        protocol: 'file',
        slashes: true
    }));
});
ipcMain.on('user:create', function(e){
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'createUser.html'),
        protocol: 'file',
        slashes: true
    }));
});

ipcMain.on('password:choosePicture', function(e){
    dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'png'] }]}).then(result => {
        if(result.canceled==false){
            console.log(result.filePaths)
            mainWindow.webContents.send('password:picture', result.filePaths[0]);
        }

      }).catch(err => {
        console.log(err)
      })
      
});


// Update window
function updateWindow(){
    mainWindow.webContents.send('password:update', storage.decryptAll(dataset, mainPassword));
}

const mainMenuTemplate = [];

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
                label: 'Restart',
                click(){
                    app.relaunch()
                    app.exit()
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