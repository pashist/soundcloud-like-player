import React from 'react';
import TrackStats from './tracks-stats';

export default class PlaylistItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    render() {
        let props = this.props;
        let className = [
            'track',
            props.isCurrent && 'current',
            props.isActive && 'active',
            props.isPlaying && props.isCurrent && 'playing',
            props.track.policy && props.track.policy.toLowerCase()
        ].filter(val => val).join(' ');
        let imgUrl = (props.track.artwork_url || props.track.user.avatar_url || '').replace(/large/, 'tiny');
        let style = {};
        if (props.colors) {
            if (props.isActive && props.colors.trackActive) {
                style.color = props.colors.trackActive
            } else if (!props.isCurrent && props.colors.track) {
                style.color = props.colors.track
            }
        }
        return (
            <div className="playlist-item">
                <div className={className} onClick={this.onClick}>
                    <div className="image">
                        {imgUrl ? <img src={imgUrl}/> : ''}
                    </div>
                    <div className="extra">
                        <TrackStats track={this.props.track} showPlayCount={this.props.showPlayCount}/>
                    </div>
                    <div className="content" style={style}>
                        {this.props.track.user.username} - {this.props.track.title}
                    </div>
                </div>
            </div>
        )
    }

    isAllowed() {
        return this.props.track.policy ? this.props.track.policy == 'ALLOW' : true
    }

    onClick() {
        this.isAllowed() && this.props.onClick(this.props.index)
    }
}