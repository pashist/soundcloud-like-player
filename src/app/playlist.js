import React from 'react';
import PlaylistItem from './playlist-item';
import {connect} from 'react-redux';
import {actionSetTrack} from './store';

export default class Playlist extends React.Component {
    render() {
        return (
            <div className="playlist">
                {this.props.tracks.map((track, i) =>
                    <PlaylistItem
                        key={i}
                        isCurrent={i == this.props.index}
                        isPlaying={this.props.isPlaying}
                        track={track}
                        onClick={this.onClick.bind(this, i)}
                        colors={this.props.options.colors.playlist}
                    />)
                }
            </div>
        )
    }

    onClick(i) {
        this.props.dispatch(actionSetTrack(i))
    }

}

export default connect(state => state)(Playlist);