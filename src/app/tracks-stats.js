import React from 'react';
import numscale from 'numscale';

export default class TrackStats extends React.Component {
    render() {
        let track = this.props.track;
        let value = track ? numscale.scale({value: track.playback_count, powerOf: 10, maxLen: 5}) : '0';
        return (
            <div className="track-stats">
                <span className="playback-count">{value}</span>
            </div>
        )
    }
}