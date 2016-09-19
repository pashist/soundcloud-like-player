import React from 'react';
import PlayerArtwork from './player-artwork';
import PlayerButton from './player-button';
import PlayerTitle from './player-title';
import MediaButtons from './media-buttons';
import PlayerWaveForm from './player-waveform';
import TracksTotal from './tracks-total';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {get as getProperty} from 'lodash'

@connect(state => ({
    isPlaying: state.isPlaying,
    isPlayed: state.isPlayed,
    track: state.track,
    options: state.options,
    player: state.player,
    playlist: state.playlist,
    scrollValue: state.scrollValue,
    playlistHeight: state.playlistHeight,
    isSharePanelActive: state.isSharePanelActive,
    tracks: state.tracks
}))

export default class PlayerVisual extends React.Component {

    constructor(props) {
        super(props);
        this.onShareBtnClick = this.onShareBtnClick.bind(this);
        this.onWaveFormClick = this.onWaveFormClick.bind(this);
        this.onSeek = this.onSeek.bind(this);
        this.togglePlayback = this.togglePlayback.bind(this);
    }

    render() {

        const {track, playlist, player, isPlaying, isPlayed, options, isSharePanelActive} = this.props;
        if (!track) return null;
        let style = {
            backgroundImage: `url(${this.getBgUrl()})`,
            height: this.calcHeight() + 'px'
        };
        return (
            <div className="player" style={style}>
                <div className="sound">
                    <div className="sound-header">
                        <PlayerButton color={getProperty(options, 'colors.playButton')} track={track}
                                      isPlaying={isPlaying} player={player}
                                      onClick={this.togglePlayback}/>
                        <MediaButtons data={playlist || track}
                                      isPlayed={isPlayed}
                                      options={options}
                                      onShareBtnClick={this.onShareBtnClick}
                                      isSharePanelActive={isSharePanelActive}/>
                        <PlayerTitle data={playlist|| track}/>
                    </div>
                    <div className="sound-footer">
                        {isPlayed && <PlayerArtwork track={track} showFollowButton={false}/>}
                        {isPlayed && <PlayerWaveForm onSeek={this.onSeek} onClick={this.onWaveFormClick} colors="light"/>}
                        {!isPlayed && playlist && <TracksTotal value={this.calcTracksTotal()} />}
                    </div>
                </div>
            </div>
        )
    }

    togglePlayback() {
        this.props.dispatch(actions.toggle());
    }

    onWaveFormClick() {
        this.props.dispatch(actions.play());
    }

    onSeek(time) {
        this.props.dispatch(actions.setTrackCurrentTime(time));
    }

    onShareBtnClick() {
        this.props.dispatch(actions.toggleSharePanel())
    }

    getBgUrl(size = '500x500') {
        const defaultUrl = 'http://a1.sndcdn.com/images/default_artwork_large.png';
        let url;
        if (this.props.playlist) {
            url = this.props.playlist.artwork_url || this.props.playlist.user.avatar_url;
        } else {
            url = this.props.track.artwork_url || this.props.track.user.avatar_url;
        }
        if (url) {
            url = url.replace(/large\./, `t${size}.`);
        }
        return url || defaultUrl;
    }

    calcHeight() {
        return this.props.options.height - (this.props.playlist ? this.props.playlistHeight : 0)
    }

    calcTracksTotal(){
        return this.props.tracks.filter(track => !track.error).length
    }
}