import React from 'react';
import ReactDOM from 'react-dom';
import PlayerArtwork from './player-artwork';
import PlayerButton from './player-button';
import PlayerTitle from './player-title';
import MediaButtons from './media-buttons';
import PlayerWaveForm from './player-waveform';
import TrackStats from './tracks-stats';
import SharePanel from './share-panel';
import {connect} from 'react-redux';
import {actionPlay, actionPause, actionToggle, actionSetTrackCurrentTime} from './store';
import {get as getProperty} from 'lodash'

class Player extends React.Component {
    render() {
        let track = this.props.track;
        if (!this.props.player) return null;
        return (
            <div className="player">
                <PlayerArtwork track={track} options={this.props.options} />
                <div className="sound">
                    <div className="sound-header">
                        <PlayerButton color={getProperty(this.props, 'options.colors.playButton')} track={track}
                                      isPlaying={this.props.isPlaying} onClick={this.togglePlayback.bind(this)}/>
                        <MediaButtons />
                        <PlayerTitle track={track}/>
                    </div>
                    <PlayerWaveForm
                        onSeek={this.onSeek.bind(this)}
                        onClick={this.onWaveFormClick.bind(this)}
                    />
                    <div className="sound-footer">
                        <TrackStats track={track} showPlayCount={this.props.options.showPlayCount}/>
                    </div>
                    <SharePanel />
                </div>
            </div>
        )
    }

    handleSeek(time) {

    }

    togglePlayback() {
        this.props.dispatch(actionToggle());
    }

    play() {
        this.props.dispatch(actionPlay());
    }

    onWaveFormClick() {
        this.props.dispatch(actionPlay());
    }

    pause() {
        this.props.dispatch(actionPause());
    }

    onSeek(time) {
        this.props.dispatch(actionSetTrackCurrentTime(time));
    }
}

export default connect(state => ({
    isPlaying: state.isPlaying,
    track: state.track,
    options: state.options,
    player: state.player
}))(Player);