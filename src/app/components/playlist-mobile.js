import React from 'react';
import ReactDOM from 'react-dom';
import ReactSpinner from 'react-spinjs';
import {Scrollbars} from 'react-custom-scrollbars';
import {connect} from 'react-redux';
import PlaylistItem from './playlist-item';
import * as actions from '../actions';

@connect(state => ({
    track: state.track,
    colors: state.options.colors,
    height: state.options.height,
    showPlayCount: state.options.showPlayCount,
    isPlaying: state.isPlaying,
    tracks: state.tracks,
    isFetching: state.isFetching,
    error: state.error,
    isPlayed: state.isPlayed,
    playlistHeight: state.playlistHeight,
    resetScroll: state.resetScroll,
    trackHeight: state.trackHeight,
    events: state.events
}))

export default class PlaylistMobile extends React.Component {


    constructor() {
        super();
        this.onTrackClick = this.onTrackClick.bind(this);
        this.loadTracks = this.loadTracks.bind(this);
        this.displayMoreTracks = this.displayMoreTracks.bind(this);
        this.isPlayerHeightChanged = false;
        this._playlistHeight = 0;
        this.isTracksLoaded = false;
        this.loadCount = 5;
        this.trackHeight = 31; //todo need to calculate
        this.state = {
            displayCount: 0
        };

    }

    componentDidMount() {
        this.showTracksIfNeeded();
    }

    componentDidUpdate() {

        this.showTracksIfNeeded();
        this.loadTracksIfNeeded();

        if (this._playlistHeight !== this.playlistHeight) {
            this._playlistHeight = this.playlistHeight;
            this.props.events.emit('resize');
        }
    }

    render() {
        const {tracks, showPlayCount, colors, isPlayed, isPlaying} = this.props;
        let className = 'playlist mobile';
        if (this.isEnded()) className += ' loaded';
        return (
            <div className={className}>
                {this.tracksLoaded().slice(0, this.state.displayCount).map((track, i) =>
                    <PlaylistItem
                        key={i}
                        index={i}
                        isCurrent={this.isCurrent(track)}
                        isActive={this.isCurrent(track) && isPlayed}
                        isPlaying={isPlaying}
                        isLast={tracks.length == i+1}
                        track={track}
                        onClick={this.onTrackClick}
                        colors={colors.playlist}
                        showPlayCount={showPlayCount}
                    />)
                }
                <div className="footer">
                    {this.end}
                    {this.throbber}
                    {this.loadMore}
                </div>
                <div style={{clear:'both'}}></div>
            </div>
        )
    }

    isCurrent(track) {
        return this.props.track && this.props.track.id == track.id
    }

    onTrackClick(i) {
        this.props.dispatch(this.isCurrent(this.props.tracks[i]) ? actions.toggle() : actions.setTrack(i));
    }

    /**
     * initial load count
     * @returns {number}
     */
    numTracksToLoad() {
        let result = 0;
        let required = this.numTracksToDisplay();
        let loaded = this.tracksLoaded().length;
        if (required > loaded) {
            result = required - loaded;
        }
        return result;
    }

    numTracksToDisplay() {
        return Math.floor((this.props.playlistHeight - this.playlistFooterHeight) / this.trackHeight);
    }

    idsTracksToLoad(count) {
        return this.tracksNotLoaded().slice(0, count).map(item => item.id);
    }

    tracksNotLoaded() {
        return this.props.tracks.filter(track => !track.user && !track.error);
    }

    tracksLoaded() {
        return this.props.tracks.filter(track => track.user);
    }

    loadTracksIfNeeded() {
        if (this.isLoading() || this.isLastTrackLoaded()) return;
        if (this.state.displayCount > this.tracksLoaded().length) {
            this.loadTracks(this.state.displayCount - this.tracksLoaded().length);
        }
    }
    showTracksIfNeeded() {
        if (this.props.playlistHeight && this.props.tracks.length && !this.state.displayCount) {// show initial tracks
            this.setState({displayCount: this.numTracksToDisplay()});                           // when height set
        }
    }
    loadTracks(count = this.loadCount) {
        if (!this.props.isFetching && !this.props.error) {
            let ids = this.idsTracksToLoad(count);
            ids.length && this.props.dispatch(actions.fetchTracksData(ids))
        }

    }

    isLastTrackLoaded() {
        return this.props.tracks.length && this.props.tracks[this.props.tracks.length - 1].title
    }

    isEnded() {
        return this.props.tracks.length
            && this.tracksNotLoaded().length == 0
            && this.state.displayCount >= this.tracksLoaded().length;
    }

    isLoading() {
        return this.props.isFetching;
    }



    displayMoreTracks() {
        //TODO track limit 
        this.setState({displayCount: this.state.displayCount + this.loadCount});
    }

    updateHeight() {

        this.props.dispatch(
            actions.updateOptions({
                height: this.props.height + this.playlistHeight - this.props.playlistHeight
            })
        )
    }

    get playlistFooterHeight() {
        return ReactDOM.findDOMNode(this).querySelector('.footer').offsetHeight;
    }
    get playlistHeight() {
        return ReactDOM.findDOMNode(this).offsetHeight;
    }

    get throbber() {
        const conf = {
            width: 3,
            length: 6,
            radius: 8
        };
        return this.isLoading()
            ? <div className="playlist-throbber"><ReactSpinner config={conf}/></div>
            : null
    }

    get end() {
        return this.isEnded() ? <div className="playlist-end"></div> : null
    }

    get loadMore(){
     return this.props.tracks.length && !this.isEnded() && !this.isLoading()
         ? <center><button className="load-more" onClick={this.displayMoreTracks}>load more</button></center>
         : null;
    }
}