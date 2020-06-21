function mainWindow(){
    const ul = document.querySelector('.passwords');
    ipcRenderer.on('password:update', function(e, decryptedDatabase){
        ul.innerHTML = "";
        for(let i=0; i<decryptedDatabase.length; i++){
            const li = document.createElement('tr');
            li.innerHTML = 
            `
            <td><img src="../../storage/icons/${decryptedDatabase[i].icon}" onerror="this.onerror=null; this.src='../../storage/icons/default.png'"></td>
            <td>${decryptedDatabase[i].service}</td>
            <td>${decryptedDatabase[i].login}</td>
            <td><input type="password" value="${decryptedDatabase[i].password}" id="pass"><input type="checkbox" onclick="myFunction(${i})">Show</td>
            <td><i class="fas fa-trash" onclick="deletePassword(${i})"></i></td>
            `
            ul.appendChild(li);
        }
    })

    // Gets user information
    ipcRenderer.send('user:info');

    ipcRenderer.on('user:infosent', function(e, info){
        const information = info;
        document.querySelector(".welcome h1").innerHTML = `Welcome, <span style="color: #7289da">${information}</span>`;
    })

    ipcRenderer.send('password:update');
}

function myFunction(x) {
    var pass = document.querySelectorAll("#pass");
    if (pass[x].type === "password") {
        pass[x].type = "text";
    } else {
        pass[x].type = "password";
    }
} 

function deletePassword(i){
    const item = {
        index: i
    }    
    ipcRenderer.send('password:delete', item);
}