const sidenav = 
`
<a><i class="fas fa-home" onclick="ipcRenderer.send('page:home');"></i></a>
<a><i class="fas fa-plus-circle" onclick="ipcRenderer.send('password:create');"></i></a>
<a><i class="fas fa-user" onclick="ipcRenderer.send('user:create');"></i></a>
<a><i class="fas fa-bookmark"></i></a>
<a><i class="fas fa-sliders-h"></i></a>
`

document.body.querySelector('.sidenav').innerHTML = sidenav;