import React from 'react';

export default class PlayerArtwork extends React.Component {
    render() {
        let imgUrl = this.props.track ? this.props.track.artwork_url || this.props.track.user.avatar_url : null;
        return (
            <div className="artwork">
                <div className="image">{imgUrl ? <img src={imgUrl} /> : ''}</div>
            </div>
        )
    }
}