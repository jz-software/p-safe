function manage(){
    let defaultValue;
    ipcRenderer.on('page:profile:info:send', function(e, user){
        document.querySelector('#login').value = user.user;
        document.querySelector('#email').value = user.email;
        document.querySelector('#profile-pic').setAttribute('src', `${path}${user.picture}`);
        document.querySelector('#nickname').textContent = user.user;
        document.querySelector('#password').value = user.password;
        defaultValue = user.password;
    })
    ipcRenderer.send('page:profile:info');

    ipcRenderer.on('cropper:picture', function(e, path){
        ipcRenderer.send('page:cropper', path, 'manageUser');
    })

    ipcRenderer.on('page:cropper:out:manageUser', function(e, picPath){
        document.querySelector('#profile-pic').setAttribute('src', picPath);
        document.querySelector('#profile-pic').setAttribute('realPath', picPath);
        document.querySelector('#profile-pic').setAttribute('changed', 'true');

        // Hides default
        document.querySelector('#profile-pic-default').style.display = "none";
        // Shows img
        document.querySelector('#profile-pic').style.display = "inline-block";
    });

    const repeatPassword = document.getElementById('password');
    const repeatPassHandler = function(e) {
        if(document.getElementById('password').value==defaultValue){
            document.querySelector('.repeat-password').style.visibility = 'hidden';
            document.querySelector('.repeat-password').style.opacity = '0';
            document.querySelector('#password').setAttribute('changed', 'false');
        }
        else{
            document.querySelector('.repeat-password').style.visibility = 'visible';
            document.querySelector('.repeat-password').style.opacity = '1';
            document.querySelector('#password').setAttribute('changed', 'true');
        }
    }
    repeatPassword.addEventListener('input', repeatPassHandler);
    repeatPassword.addEventListener('propertychange', repeatPassHandler); // for IE8
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

    if(document.querySelector('#password').getAttribute('changed')=='true'){
        if(document.querySelector('#password').value==document.querySelector('#repeat-password').value){
            user.password = document.querySelector('#password').value;
            ipcRenderer.send('page:profile:save', user);
        }
        else{
            document.querySelector('#repeat-password').style.borderBottom = "1px solid red";
        }
    }
    else{
        ipcRenderer.send('page:profile:save', user);
    }
}

function manageShowPassword(i){
    if(document.querySelectorAll('.password')[i].type=='password'){
        document.querySelectorAll('.password')[i].type = 'text';
        document.querySelectorAll('#manage-show-password')[i].setAttribute('class', 'fas fa-low-vision');
    }
    else{
        document.querySelectorAll('.password')[i].type = 'password';
        document.querySelectorAll('#manage-show-password')[i].setAttribute('class', 'fas fa-eye');
    }
}