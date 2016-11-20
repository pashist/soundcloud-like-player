import React from 'react';
import PlayerArtwork from './player-artwork';
import PlayerButton from './player-button';
import PlayerTitle from './player-title';
import MediaButtons from './media-buttons';
import PlayerWaveForm from './player-waveform';
import SharePanel from './share-panel';
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

        this.mainColor = {
            url: '',
            color: [],
            isFetching: false
        };

        this.defaultUrl = 'https://a1.sndcdn.com/images/default_artwork_large.png';
    }

    componentDidUpdate() {
        this.detectMainColor();
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
                        <PlayerButton colors={options.colors} track={track}
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
                        {isPlayed && playlist && <PlayerArtwork track={track} showFollowButton={false}/>}
                        {(isPlayed || !playlist) &&
                        <PlayerWaveForm onSeek={this.onSeek} onClick={this.onWaveFormClick} colors="light"/>}
                        {!isPlayed && playlist && <TracksTotal value={this.calcTracksTotal()}/>}
                    </div>
                    <SharePanel
                        isActive={isSharePanelActive}
                        data={playlist || track}/>
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
        
        let url;
        if (this.props.playlist) {
            url = this.props.playlist.artwork_url || this.props.playlist.user.avatar_url;
        } else if(this.props.track) {
            url = this.props.track.artwork_url || this.props.track.user.avatar_url;
        }
        if (url) {
            url = url.replace(/large\./, `t${size}.`);
        }
        return url || this.defaultUrl;
    }

    detectMainColor() {
        const imgUrl = this.getBgUrl();
        if (this.defaultUrl == imgUrl || this.mainColor.isFetching) return;
        if (this.mainColor.url != imgUrl || !this.mainColor.color.length) {
            this.mainColor.isFetching = true;
            this.mainColor.url = imgUrl;
            fetch(imgUrl)
                .then(response => response.blob())
                .then(blob => {
                    this.mainColor.isFetching = false;
                    let image = new Image();
                    image.src = URL.createObjectURL(blob);
                    image.onload = () => {
                        let canvas = document.createElement('canvas');
                        let context = canvas.getContext('2d');
                        canvas.width = image.width;
                        canvas.height = image.height;
                        context.drawImage(image, 0, 0);
                        let pixelData = context.getImageData(0, 0, image.width, image.height).data;
                        let pixelCount = image.width*image.height;
                        let avg = [0,0,0];
                        for (let i = 0, offset; i < pixelCount; i = i + 1) {
                            offset = i * 4;
                            avg[0] += pixelData[offset + 0];
                            avg[1] += pixelData[offset + 1];
                            avg[2] += pixelData[offset + 2];
                        }
                        avg = avg.map(val => Math.round(val/pixelCount));
                        this.mainColor.color = avg;
                        this.props.dispatch(actions.setMainColor(this.mainColor.color));
                    }
                })
                .catch(err => {
                    console.log('detectMainColor error:', err);
                    this.mainColor.isFetching = false;
                });
        }
    }

    calcHeight() {
        return this.props.options.height - (this.props.playlist ? this.props.playlistHeight : 0)
    }

    calcTracksTotal() {
        return this.props.tracks.filter(track => !track.error).length
    }
}