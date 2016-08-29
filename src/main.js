
//import SoundCloudLikePlayer from '../dist';
import SoundCloudLikePlayer from './player';

let player = new SoundCloudLikePlayer({
    container: document.getElementById('example'),
    clientId: 'cf92370f6c9691fab24bdf6791b57d61',
    autoplay: false
});
player.on('ended', () => player.next());
//player.resolve('http://soundcloud.com/jxnblk/sets/yello');
player.search({q: 'buskers', limit: 20, offset: 10});
