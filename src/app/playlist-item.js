import React from 'react';
import TrackStats from './tracks-stats';

export default class PlaylistItem extends React.Component {
    render() {
        let className = [
            'track',
            this.props.isCurrent ? 'current' : '',
            this.props.isPlaying && this.props.isCurrent ? 'playing' : ''
        ].join(' ');
        let imgUrl = this.props.track.artwork_url ? this.props.track.artwork_url.replace(/large/, 'tiny') : '';
        return (
            <div className={className} onClick={this.props.onClick}>
                <div className="image">{imgUrl ? <img src={imgUrl} /> : ''}</div>
                <div className="extra"><TrackStats track={this.props.track}/></div>
                <div className="content">{this.props.track.title}</div>

            </div>
        )
    }
    
}