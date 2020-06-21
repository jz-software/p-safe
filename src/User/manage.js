function manage(){
    ipcRenderer.on('page:profile:info:send', function(e, user){
        document.querySelector('#login').value = user.user;
        document.querySelector('#email').value = user.email;
        document.querySelector('#profile-pic').setAttribute('src', `../../${user.picture}`);
        document.querySelector('#nickname').textContent = user.user;
    })
    ipcRenderer.send('page:profile:info');

    ipcRenderer.on('cropper:picture', function(e, path){
        ipcRenderer.send('page:cropper', path);
    })

    ipcRenderer.on('page:cropper:out', function(e, picPath){
        document.querySelector('#profile-pic').setAttribute('src', '../../'+picPath);
        document.querySelector('#profile-pic').setAttribute('realPath', picPath);
        document.querySelector('#profile-pic').setAttribute('changed', 'true');
    });
}

function saveUser(){
    const user = {
        login: document.querySelector('#login').value,
        email: document.querySelector('#email').value,
        picture: {
            changed: document.querySelector('#profile-pic').getAttribute('changed'), 
            path: document.querySelector('#profile-pic').getAttribute('realPath'),
        }
    }
    ipcRenderer.send('page:profile:save', user);
}