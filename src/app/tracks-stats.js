import React from 'react';
import numscale from 'numscale';

export default class TrackStats extends React.Component {
    render() {
        if (!this.props.track) return null;
        let playback_count = this.props.track && this.props.track.playback_count || 0;
        let value = numscale.scale({value: playback_count, powerOf: 10, maxLen: 5});
        return (
            <div className="track-stats">
                <span className="playback-count">{value}</span>
            </div>
        )
    }
}