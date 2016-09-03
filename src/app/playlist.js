import React from 'react';
import ScrollArea from 'react-scrollbar';
import {connect} from 'react-redux';
import PlaylistItem from './playlist-item';
import {actionSetTrack} from './store';

class Playlist extends React.Component {
    render() {
        return (
            <div className="playlist">
                <ScrollArea
                    smoothScrolling={true}
                    speed={0.8}
                    className="area"
                    contentClassName="content"
                    horizontal={false}>
                    <div>
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
                </ScrollArea>
            </div>
        )
    }

    onClick(i) {
        this.props.dispatch(actionSetTrack(i))
    }

}

export default connect(state => state)(Playlist);