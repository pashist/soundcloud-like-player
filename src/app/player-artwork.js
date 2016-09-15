import React from 'react';
import PlayerArtworkFollow from './player-artwork-follow';

export default class PlayerArtwork extends React.Component {

    render() {
        let size = window.window.devicePixelRatio > 1 ? '500x500' : '200x200';
        let imgUrl = this.getImageUrl(size);
        return (
            <div className="artwork">
                <div className="image" style={{backgroundImage:`url(${imgUrl})`}}></div>
                {this.props.options.showFollowButton ? <PlayerArtworkFollow /> : ''}
            </div>
        )
    }

    getImageUrl(size = '200x200') {
        const defaultUrl = 'http://a1.sndcdn.com/images/default_artwork_large.png';
        let url;
        if (this.props.track) {
            url = this.props.track.artwork_url || this.props.track.user.avatar_url;
            if (url) {
                url = url.replace(/large\./, `t${size}.`);
            }
        }
        return url || defaultUrl;
    }
}