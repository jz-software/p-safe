const Storage = require('./src/Storage');

const storage = new Storage();
storage.checkDatabase();

let dataset;
let user;

const electron = require('electron');
const url = require('url');
const path = require('path');
const internetAvailable = require("internet-available");

const {app, BrowserWindow, Menu, ipcMain, dialog, powerMonitor} = electron;

process.env.NODE_ENV = 'development';

let mainWindow;
let child;
let deleteAccount;

let internetConnection;

app.on('ready', function(){
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './src/Login/loginWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    mainWindow.on('closed', function(){
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});


ipcMain.on('internetConnection:check', function(e){
    internetAvailable().then(function(){
        internetConnection = true;
    }).catch(function(){
        mainWindow.webContents.send('internetConnection:false');
        internetConnection = false;
    });
});

ipcMain.on('password:add', function(e, item){
    storage.savePassword(dataset.passwords, item.service, item.login, item.password, item.icon);
    mainWindow.webContents.send('page:home');
});

ipcMain.on('password:delete', function(e, item){
    console.log("Password deleted")
    storage.removePassword(dataset.passwords, item.index);
    updateWindow();
});
ipcMain.on('password:update', function(e){
    updateWindow();
});
ipcMain.on('user:login', function(e, item){
    const auth = storage.validateUser(item.login, item.password);
    if(auth==true){
        storage.password = item.password;
        dataset = storage.load()[storage.findUser('user', item.login)];
        console.log(user)
        storage.user = item.login;
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, './src/Main/mainWindow.html'),
            protocol: 'file',
            slashes: true
        }));
    }
    else{
        mainWindow.webContents.send('user:login:wrong');
    }
});
ipcMain.on('user:register', function(e, item){
    if(storage.checkUser(item.login)==true){
        mainWindow.webContents.send('user:exists');
    }
    else{
        storage.createUser(item.login, item.email, item.picture, item.password)
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, './src/Login/loginWindow.html'),
            protocol: 'file',
            slashes: true
        }));
    }    
});
ipcMain.on('user:checkLogin', function(e, item){
    const allUsers = storage.getAllUsers();
    let output = false;
    let userData;

    for(let i=0; i<allUsers.length; i++){
        if(allUsers[i]==item.username){
            output = true;
            userData = require(storage.path+path.normalize('./storage/passwords.json'))[i].picture;
        }
    }
    if(output==true){
        mainWindow.webContents.send('user:valid', userData);
    }  
    else{
        mainWindow.webContents.send('user:wrong');
    }  
});
ipcMain.on('user:info', function(e){
    mainWindow.webContents.send('user:infosent', storage.user);
});   

ipcMain.on('password:create', function(e){
    mainWindow.webContents.send('page:password');
});

ipcMain.on('user:create', function(e){
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './src/User/createUser.html'),
        protocol: 'file',
        slashes: true
    }));
});

ipcMain.on('password:choosePicture', function(e){
    dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'png'] }]}).then(result => {
        if(result.canceled==false){
            mainWindow.webContents.send('password:picture', result.filePaths[0]);
        }

      }).catch(err => {
        console.log(err)
      })
      
});
ipcMain.on('cropper:choosePicture', function(e){
    dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'png'] }]}).then(result => {
        if(result.canceled==false){
            mainWindow.webContents.send('cropper:picture', result.filePaths[0]);
        }

      }).catch(err => {
        console.log(err)
      })
      
});

ipcMain.on('page:home', function(e){
    mainWindow.webContents.send('page:home');
});
ipcMain.on('page:profile', function(){
    mainWindow.webContents.send('page:user');
})
ipcMain.on('page:profile:info', function(){
    mainWindow.webContents.send('page:profile:info:send', {
        user: dataset.user, 
        email: storage.decryptString(dataset.email, storage.password), 
        picture: dataset.picture,
        password: storage.password});
})
ipcMain.on('page:profile:save', function(e, userData){
    storage.changeUser(userData, dataset);
    if(userData.password!=undefined){
        storage.changePassword(storage.user, storage.password, userData.password);
        storage.password = userData.password;
    }
    dataset = storage.load()[storage.findUser('user', userData.login)];
    mainWindow.reload();
})
ipcMain.on('page:cropper', function(e, picPath, pagePath){
    child = new BrowserWindow({ parent: mainWindow, modal: true, show: false, width: 600, height: 500,
        webPreferences: {
            nodeIntegration: true
        }
    })
    child.loadURL(url.format({
        pathname: path.join(__dirname, `./src/Picture/cropper.html`),
        protocol: 'file',
        slashes: true
    })+'?path='+picPath+'&pagePath='+pagePath);
    // child.setMenu(null);
    child.once('ready-to-show', () => {
      child.show()
    })
});
ipcMain.on('page:cropper:cropped', function(e, img, pagePath){
    child.close();
    child = null;

    var base64Data = img.replace(/^data:image\/png;base64,/, "");
    const tempName = storage.makeString(32) + '.png';

    require("fs").writeFile(storage.path+'./storage/trash/'+tempName, base64Data, 'base64', function(err) {
        console.log(err);
        mainWindow.webContents.send(`page:cropper:out:${pagePath}`, `${storage.path}./storage/trash/${tempName}`);
    });
});
ipcMain.on('get:path', function(e){
    mainWindow.webContents.send('get:path', storage.path);
});
ipcMain.on('page:logout', function(){
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './src/Login/loginWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    storage.password = null;
    dataset = null;
    user = null;
    storage.user = null;
})
ipcMain.on('page:deleteAccount', function(){
    deleteAccount = new BrowserWindow({ parent: mainWindow, modal: true, show: false, width: 600, height: 500,
        webPreferences: {
            nodeIntegration: true
        }
    })
    deleteAccount.loadURL(url.format({
        pathname: path.join(__dirname, `./src/User/delete.html`),
        protocol: 'file',
        slashes: true
    }));
    deleteAccount.once('ready-to-show', () => {
      deleteAccount.show()
    })
});
ipcMain.on('page:deleteAccount:get', function(){
    const user = {
        nickname: storage.user,
        password: storage.password
    }
    deleteAccount.webContents.send('page:deleteAccount:get', user);
});
ipcMain.on('page:deleteAccount:delete', function(e, user, password){
    deleteAccount.close();
    deleteAccount = null;
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './src/Login/loginWindow.html'),
        protocol: 'file',
        slashes: true
    }));
    storage.deleteUser(user, password);
});

// Update window
function updateWindow(){
    mainWindow.webContents.send('password:update', storage.decryptAll(dataset.passwords));
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

// Logs out a user after certain amount of idle time
function idleTimeout() {
    const idleTime = 300; // 5 minutes (in seconds)
    app.whenReady().then(() => {
        if(powerMonitor.getSystemIdleState(idleTime+1)!='idle'){
            if(powerMonitor.getSystemIdleTime()>=idleTime){
                mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, './src/Login/loginWindow.html'),
                    protocol: 'file',
                    slashes: true
                }));
                storage.password = null;
                dataset = null;
                user = null;
                storage.user = null;

                if(child!=undefined){
                    child.close();
                    child = null;
                }
                if(deleteAccount!=undefined){
                    deleteAccount.close();
                    deleteAccount = null;
                }    
            };
        }    
    })
    setTimeout(idleTimeout, 1000);
}  
idleTimeout();

function internetTimeout(){
    if(internetConnection==false){
        internetAvailable().then(function(){
            mainWindow.webContents.send('internetConnection:true');
            internetConnection = true;
        }).catch(function(){
            mainWindow.webContents.send('internetConnection:false');
        });
    }    
    setTimeout(internetTimeout, 5000);
}
internetTimeout();