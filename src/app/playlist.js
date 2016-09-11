import React from 'react';
import ReactDOM from 'react-dom';
import ScrollArea from 'react-scrollbar';
import {connect} from 'react-redux';
import PlaylistItem from './playlist-item';
import {actionSetTrack, actionFetchTracksData} from './store';

class Playlist extends React.Component {
    componentDidMount(){
        this.loadTracksIfNeeded();
    }
    componentDidUpdate(){
        //this.loadTracksIfNeeded();
    }
    render() {
        return (
            <div className="playlist">
                <ScrollArea
                    smoothScrolling={true}
                    speed={0.8}
                    className="area"
                    contentClassName="content"
                    horizontal={false}
                    onScroll={this.onScroll.bind(this)}>
                    <div>
                        {this.props.tracks.filter(track => track.user && !track.error).map((track, i) =>
                            <PlaylistItem
                                key={i}
                                isCurrent={this.props.track && this.props.track.id == track.id}
                                isPlaying={this.props.isPlaying}
                                track={track}
                                onClick={this.onClick.bind(this, i)}
                                colors={this.props.options.colors.playlist}
                                showPlayCount={this.props.options.showPlayCount}
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
    onScroll(value) {
        if (value.topPosition + value.containerHeight >= value.realHeight) {
            this.loadTracks();
        }
    }

    numTracksToLoad(){
        const trackHeight = 30; //todo need to calculate
        const height = ReactDOM.findDOMNode(this).offsetHeight;
        return Math.floor(height/trackHeight)*2;
    }

    idsTracksToLoad(){
        return this.tracksNotLoaded().slice(0, this.numTracksToLoad()).map(item => item.id);
    }
    
    tracksNotLoaded(){
        return this.props.tracks.filter(track => !track.user && !track.error);
    }
    tracksLoaded(){
        return this.props.tracks.filter(track => track.user);
    }
    loadTracksIfNeeded(){
        if (this.numTracksToLoad() > this.tracksLoaded().length && this.tracksNotLoaded().length) {
            this.loadTracks();
        }
    }

    loadTracks(){
        if (!this.props.isFetching && !this.props.error) {
            let ids = this.idsTracksToLoad();
            ids.length && this.props.dispatch(actionFetchTracksData(ids))
        }

    }

}

export default connect(state => ({
    track: state.track,
    options: state.options,
    isPlaying: state.isPlaying,
    tracks: state.tracks,
    isFetching: state.isFetching,
    error: state.error
}))(Playlist);