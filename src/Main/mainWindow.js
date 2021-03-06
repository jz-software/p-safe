function defaultIcon(i){
    document.querySelectorAll('.icon')[i].innerHTML = '<i class="fas fa-key"></i>';
}
function truncateText(selector, maxLength) {
    var element = document.querySelector(selector),
        truncated = element.innerText;

    if (truncated.length > maxLength) {
        truncated = truncated.substr(0,maxLength) + '...';
    }
    return truncated;
}

function mainWindow(){
    const ul = document.querySelector('.passwords');
    ipcRenderer.on('password:update', function(e, decryptedDatabase){
        ul.innerHTML = "";
        for(let i=0; i<decryptedDatabase.length; i++){
            const li = document.createElement('tr');
            li.innerHTML = 
            `
            <td><div class="icon"><img src="${path}storage/icons/${decryptedDatabase[i].icon}" notfound='false' onerror="this.onerror=null; this.src='${path}./storage/icons/default.png'; defaultIcon(${i})"></div></td>
            <td><p class="service"></p></td>
            <td><input id="nickname" onclick="this.select();" readonly class="service-nickname" spellcheck="false"</td>
            <td><input type="password" value="" id="pass" readonly spellcheck="false"><i id="showPass" class="fas fa-eye" onclick="myFunction(${i})"></i></td>
            <td><i class="fas fa-trash" onclick="deletePassword(${i})"></i></td>
            `
            li.querySelector('#pass').value = decryptedDatabase[i].password;
            li.querySelector('.service').textContent = decryptedDatabase[i].service;
            li.querySelector('#nickname').value = decryptedDatabase[i].login;
            ul.appendChild(li);
        }
    })

    // Gets user information
    ipcRenderer.send('user:info');

    ipcRenderer.on('user:infosent', function(e, info){
        const information = info;
        document.querySelector(".welcome h1").innerHTML = `Welcome, <span>${information}</span>`;
        document.querySelector('.welcome h1 span').innerText = truncateText('.welcome h1 span', 20);
    })

    ipcRenderer.send('password:update');
}

function myFunction(x) {
    var pass = document.querySelectorAll("#pass");
    if (pass[x].type === "password") {
        pass[x].type = "text";
        document.querySelectorAll('#showPass')[x].setAttribute('class', 'fas fa-low-vision');
    } else {
        pass[x].type = "password";
        document.querySelectorAll('#showPass')[x].setAttribute('class', 'fas fa-eye');
    }
} 

function deletePassword(i){
    const item = {
        index: i
    }    
    ipcRenderer.send('password:delete', item);
}