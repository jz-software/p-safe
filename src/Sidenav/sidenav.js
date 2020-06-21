const sidenav = 
`
<a><i class="fas fa-home" onclick="ipcRenderer.send('page:home');"></i></a>
<a><i class="fas fa-plus-circle" onclick="ipcRenderer.send('password:create');"></i></a>
<a><i class="fas fa-user" onclick="ipcRenderer.send('page:profile');"></i></a>
<a><i class="fas fa-sign-out-alt" onclick="ipcRenderer.send('page:logout');"></i></a>
`

document.body.querySelector('.sidenav').innerHTML = sidenav;

ipcRenderer.on('page:home', function(e){
    $( ".main" ).load( "../Main/homepage.html .homepage" );
    $.getScript( "./mainWindow.js", function(){
        mainWindow();
    });
});
ipcRenderer.on('page:password', function(e){
    $( ".main" ).load( "../Password/createPassword.html .createPassword" );
});
ipcRenderer.on('page:user', function(e){
    $( ".main" ).load( "../User/manage.html .manage" );
    $.getScript( "../User/manage.js", function(){
        manage();
    });
});