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

    render() {
        let tracks = this.props.tracks.filter(track => track.user && !track.error);
        return (
            <div className="playlist">
                <ScrollArea
                    smoothScrolling={false}
                    speed={0.8}
                    className="area"
                    contentClassName="content"
                    horizontal={false}
                    onScroll={this.onScroll.bind(this)}>
                    <div>
                        {tracks.map((track, i) =>
                            <PlaylistItem
                                key={i}
                                isCurrent={this.isCurrent(track)}
                                isActive={this.isCurrent(track) && this.props.isPlayed}
                                isPlaying={this.props.isPlaying}
                                isLast={tracks.length == i+1}
                                track={track}
                                onClick={this.onClick.bind(this, i, track)}
                                colors={this.props.options.colors.playlist}
                                showPlayCount={this.props.options.showPlayCount}
                            />)
                        }
                        {this.isLastTrackLoaded() ? <div className="playlist-end"></div> : ''}
                    </div>
                </ScrollArea>
            </div>
        )
    }

    isCurrent(track) {
        return this.props.track && this.props.track.id == track.id
    }
    onClick(i, track) {
       /* if (track.id == this.props.track.id) {
            this.props.dispatch(actionToggle())
        } else {*/
            this.props.dispatch(actionSetTrack(i))
        /*}*/
        
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
    isLastTrackLoaded() {
        return this.props.tracks.length && this.props.tracks[this.props.tracks.length-1].title
    }
}

export default connect(state => ({
    track: state.track,
    options: state.options,
    isPlaying: state.isPlaying,
    tracks: state.tracks,
    isFetching: state.isFetching,
    error: state.error,
    isPlayed: state.isPlayed
}))(Playlist);