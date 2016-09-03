//import SoundCloudLikePlayer from '../dist';
import SoundCloudLikePlayer from './player';

let player = new SoundCloudLikePlayer({
    container: document.getElementById('example'),
    clientId: 'cf92370f6c9691fab24bdf6791b57d61',
    autoplay: false,
    redirectUri: 'http://localhost:3001/callback.html'
});
player.on('ended', () => player.next());
player.resolve('https://soundcloud.com/jxnblk/sets/march-on');
//player.search({q: 'buskers', limit: 20, offset: 10});
