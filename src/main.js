//import SoundCloudLikePlayer from '../dist';
import SoundCloudLikePlayer from './player';

let player = new SoundCloudLikePlayer({
    container: document.getElementById('example'),
    playerClientId: 'cUa40O3Jg3Emvp6Tv4U6ymYYO50NUGpJ',
    clientId: 'cf92370f6c9691fab24bdf6791b57d61',
    autoplay: false,
    nativePlayer: true,
    redirectUri: 'http://localhost:3001/callback.html',
//    apiUrl: 'https://wix-soundcloud.appspot.com/api-v2',
    visual: true,
    height: 500
});


let form = document.createElement('form');
let urlInput = document.createElement('input');
let submitBtn = document.createElement('button');
submitBtn.textContent = 'submit';
urlInput.style.width = '300px';
form.appendChild(urlInput);
form.appendChild(submitBtn);
form.style.marginTop = '50px';

document.body.appendChild(form);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(urlInput.value);
    player.resolve(urlInput.value);
});
/*player.player.configure('_baseUrl', 'http://52.169.29.134/sc-tpa/api');
player.on('ended', () => player.next());*/
//player.resolve('https://soundcloud.com/kranky/oren-ambarchi-robin-fox');
player.resolve('http://api.soundcloud.com/playlists/1595551');
/*setTimeout(()=> {
        player.update({apiUrl: 'https://api.soundcloud.com'});
        player.reload();
}, 3000);*/
//player.resolve('https://soundcloud.com/user115442976/sets/jammin-inna-concrete-jungle');
//player.search({q: 'buskers', limit: 20, offset: 10});
