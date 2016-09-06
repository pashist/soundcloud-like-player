import React from 'react';
import TrackStats from './tracks-stats';

export default class PlaylistItem extends React.Component {
    render() {
        let props = this.props;
        let className = [
            'track',
            props.isCurrent ? 'current' : '',
            props.isPlaying && props.isCurrent ? 'playing' : ''
        ].join(' ');
        let imgUrl = props.track.artwork_url ? props.track.artwork_url.replace(/large/, 'tiny') : '';
        let style = {};
        if (props.colors) {
            if(props.isCurrent && props.colors.trackActive) {
                style.color = props.colors.trackActive
            } else if (!props.isCurrent && props.colors.track) {
                style.color = props.colors.track
            }
        }
        return (
            <div className={className} onClick={this.props.onClick}>
                <div className="image">{imgUrl ? <img src={imgUrl} /> : ''}</div>
                <div className="extra"><TrackStats track={this.props.track}/></div>
                <div className="content" style={style}>{this.props.track.user.username} - {this.props.track.title}</div>
            </div>
        )
    }
    
}