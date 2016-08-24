# SoundCloudLikePlayer
## Usage example
```
import SoundCloudLikePlayer from 'soundcloud-like-player';

let player = new SoundCloudLikePlayer({
    container: document.getElementById('example'),
    clientId: 'cf92370f6c9691fab24bdf6791b57d61'
});
player.on('ended', () => player.next());
player.resolve('http://soundcloud.com/jxnblk/sets/yello').then(() => player.play());
```
## API
Coming soon...