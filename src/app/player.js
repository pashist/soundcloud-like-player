import React from 'react';
import PlayerArtwork from './player-artwork';
import PlayerButton from './player-button';
import PlayerTitle from './player-title';
import PlayerWaveForm from './player-waveform';
import {connect} from 'react-redux';
import {actionPlay, actionPause, actionToggle, actionSetTrackCurrentTime} from './store';

export default class Player extends React.Component {

    render() {
        return (
            <div className="player">
                <PlayerArtwork track={this.props.tracks[this.props.index]}/>
                <div className="sound">
                    <div className="header">
                        <PlayerButton
                            isPlaying={this.props.isPlaying}
                            onClick={this.togglePlayback.bind(this)}
                        />
                        <PlayerTitle
                            track={this.props.tracks[this.props.index]}
                        />
                    </div>
                    <PlayerWaveForm
                        onSeek={this.onSeek.bind(this)}
                        onClick={this.onWaveFormClick.bind(this)}
                    />
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
    onSeek(time){
        this.props.dispatch(actionSetTrackCurrentTime(time));
    }
}

export default connect(state => state)(Player);