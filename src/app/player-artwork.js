import React from 'react';
import PlayerArtworkFollow from './player-artwork-follow';

export default class PlayerArtwork extends React.Component {

    render() {
        let imgUrl = this.extractImageUrl();
        return (
            <div className="artwork">
                <div className="image" style={{backgroundImage:`url(${imgUrl})`}}></div>
                <PlayerArtworkFollow />
            </div>
        )
    }

    extractImageUrl(size = '200x200') {
        const defaultUrl = 'http://a1.sndcdn.com/images/default_artwork_large.png';
        let artworkUrl;
        if (this.props.track && this.props.track.artwork_url) {
            artworkUrl = this.props.track.artwork_url.replace(/large\./, `t${size}.`);
        }
        return artworkUrl || defaultUrl;
    }
}