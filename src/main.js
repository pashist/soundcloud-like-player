
//import SoundCloudLikePlayer from '../dist';
import SoundCloudLikePlayer from './player';

let player = new SoundCloudLikePlayer({
    container: document.getElementById('example'),
    clientId: 'cf92370f6c9691fab24bdf6791b57d61',
    autoplay: false
});
player.on('ended', () => player.next());
player.search({q: 'Robert Miles'}).then(data => console.log('data', data)).catch(err => console.log('err', err));
