const sidenav = 
`
<a><i class="fas fa-home" onclick="ipcRenderer.send('page:home');"></i></a>
<a><i class="fas fa-plus-circle" onclick="ipcRenderer.send('password:create');"></i></a>
<a><i class="fas fa-user" onclick="ipcRenderer.send('page:profile');"></i></a>
<a><i class="fas fa-sign-out-alt" onclick="ipcRenderer.send('page:logout');"></i></a>
`

document.body.querySelector('.sidenav').innerHTML = sidenav;