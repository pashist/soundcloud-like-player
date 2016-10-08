import React from 'react';
import ReactDOM from 'react-dom';
import ScrollArea from 'react-scrollbar';
import ReactSpinner from 'react-spinjs';
import {Scrollbars} from 'react-custom-scrollbars';
import {connect} from 'react-redux';
import PlaylistItem from './playlist-item';
import * as actions from '../actions';

class Playlist extends React.Component {
    constructor() {
        super();
        this.onTrackClick = this.onTrackClick.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.isPlayerHeightChanged = false;
        this.isTracksLoaded = false;
    }

    componentDidMount() {
        this.loadTracksIfNeeded();
    }

    componentWillReceiveProps(props) {
        this.isPlayerHeightChanged = props.playlistHeight != this.props.playlistHeight;
        this.isTracksLoaded = props.tracks != this.props.tracks;
    }
    componentDidUpdate(){
        this.loadTracksIfNeeded();
        if (this.props.resetScroll) {
            this.refs.scrollbars.scrollToTop();
            this.props.dispatch(actions.setStateValue('resetScroll', false))
        }
    }

    render() {
        const {tracks, playlistHeight, isPlayed, options, isPlaying, isFetching} = this.props;
        let loadedTracks = tracks.filter(track => track.user && !track.error);
        let className = 'playlist';
        if (this.isLoaded()) className += ' loaded';
        if (!loadedTracks.length) className += ' empty';
        return (
            <div className={className} style={options.visual ? {height: playlistHeight} : {}}>
                <Scrollbars
                    ref="scrollbars"
                    onScroll={this.onScroll}
                    autoHide
                    style={{height: playlistHeight}}
                >
                    {loadedTracks.map((track, i) =>
                        <PlaylistItem
                            key={i}
                            index={i}
                            isCurrent={this.isCurrent(track)}
                            isActive={this.isCurrent(track) && isPlayed}
                            isPlaying={isPlaying}
                            isLast={tracks.length == i+1}
                            track={track}
                            onClick={this.onTrackClick}
                            colors={options.colors.playlist}
                            showPlayCount={options.showPlayCount}
                        />)
                    }
                    {
                        this.isLoaded() 
                        ? <div className="playlist-end"></div> 
                        : <div className="playlist-throbber"><ReactSpinner config={this.spinnerConfig}/></div>
                    }
                </Scrollbars>
            </div>
        )
    }

    isCurrent(track) {
        return this.props.track && this.props.track.id == track.id
    }

    onTrackClick(i) {
        this.props.dispatch(actions.setTrack(i));
    }

    onScroll() {

        let values = this.refs.scrollbars.getValues();
        if (values.scrollTop + values.clientHeight + this.props.trackHeight >= values.scrollHeight) {
            this.loadTracks();
        }
        if (this.props.options.visual) {
            if (this.isPlayerHeightChanged) {
                this.isPlayerHeightChanged = false;
                return;
            }
            const maxHeight = this.props.options.height - 170;
            let height = 3 * this.props.trackHeight + values.scrollTop * (values.scrollTop / 100);
            this.props.dispatch(actions.setPlaylistHeight(Math.min(height, maxHeight)));
        }
    }

    numTracksToLoad() {
        const trackHeight = 31; //todo need to calculate
        const height = ReactDOM.findDOMNode(this).offsetHeight;
        return Math.floor(height / trackHeight) * 2;
    }

    idsTracksToLoad() {
        return this.tracksNotLoaded().slice(0, this.numTracksToLoad()).map(item => item.id);
    }

    tracksNotLoaded() {
        return this.props.tracks.filter(track => !track.user && !track.error);
    }

    tracksLoaded() {
        return this.props.tracks.filter(track => track.user);
    }

    loadTracksIfNeeded() {
        if (!this.isTracksLoaded && this.numTracksToLoad() > this.tracksLoaded().length && this.tracksNotLoaded().length) {
            this.loadTracks();
        }
    }

    loadTracks() {
        if (!this.props.isFetching && !this.props.error) {
            let ids = this.idsTracksToLoad();
            ids.length && this.props.dispatch(actions.fetchTracksData(ids))
        }

    }

    isLastTrackLoaded() {
        return this.props.tracks.length && this.props.tracks[this.props.tracks.length - 1].title
    }

    isLoaded() {
        return this.tracksNotLoaded().length == 0;
    }
    
    get spinnerConfig() {
        return {
            width: 3,
            length: 6,
            radius: 8
        }
    }
}

export default connect(state => ({
    track: state.track,
    options: state.options,
    isPlaying: state.isPlaying,
    tracks: state.tracks,
    isFetching: state.isFetching,
    error: state.error,
    isPlayed: state.isPlayed,
    playlistHeight: state.playlistHeight,
    resetScroll: state.resetScroll,
    trackHeight: state.trackHeight
}))(Playlist);