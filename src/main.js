//import SoundCloudLikePlayer from '../dist';
import SoundCloudLikePlayer from './player';

let player = new SoundCloudLikePlayer({
    container: document.getElementById('example'),
    playerClientId: 'cUa40O3Jg3Emvp6Tv4U6ymYYO50NUGpJ',
    clientId: 'cf92370f6c9691fab24bdf6791b57d61',
    autoplay: false,
    nativePlayer: true,
    redirectUri: 'http://localhost:3001/callback.html',
    apiUrl: 'http://52.169.29.134/sc-tpa/api'
    
});

/*player.player.configure('_baseUrl', 'http://52.169.29.134/sc-tpa/api');
player.on('ended', () => player.next());*/
//player.resolve('https://api.soundcloud.com/playlists/218563529');
player.resolve('https://soundcloud.com/bigbabydram/sets/d-r-a-m-friends');
//player.search({q: 'buskers', limit: 20, offset: 10});
