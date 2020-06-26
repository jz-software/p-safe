let data = {};

function submitPassword(){
    const service = document.querySelector("#service");
    const username = document.querySelector("#username");
    const pass1 = document.querySelector("#pass1");
    const pass2 = document.querySelector("#pass2");

    if(pass1.value==pass2.value){
        const item = {
            service: service.value,
            login: username.value,
            password: pass1.value,
            icon: data.picture
        }    
        ipcRenderer.send('password:add', item);
    }
    else{
        pass1.style.padding = "10px"
        pass1.style.animation = "shake 0.3s"
        pass2.style.animation = "shake 0.3s"
        pass1.setAttribute('placeholder', '')
        pass2.setAttribute('placeholder', '')
        pass1.style.color = "red";
        pass2.style.color = "red";
        pass1.style.borderBottom = "1px solid red";
        pass2.style.borderBottom = "1px solid red";
    }
}

ipcRenderer.on('password:picture', function(e, picture){
    ipcRenderer.send('page:cropper', picture, 'createPassword');
});   

ipcRenderer.on('page:cropper:out:createPassword', function(e, picPath){
    document.querySelector('h1').innerHTML = `<img src="${picPath}" width=64 height=64>`;
    data.picture = picPath;
});