import React from 'react';
import PlayerArtwork from './player-artwork';
import PlayerButton from './player-button';
import PlayerTitle from './player-title';
import MediaButtons from './media-buttons';
import PlayerWaveForm from './player-waveform';
import TrackStats from './tracks-stats';
import SharePanel from './share-panel';
import {connect} from 'react-redux';
import * as actions from '../actions';
import {get as getProperty} from 'lodash'

class Player extends React.Component {
    constructor(props) {
        super(props);
        this.onShareBtnClick = this.onShareBtnClick.bind(this);
        this.onWaveFormClick = this.onWaveFormClick.bind(this);
        this.onSeek = this.onSeek.bind(this);
        this.togglePlayback = this.togglePlayback.bind(this);
    }

    render() {
        const {track, options, isPlaying, player, isPlayed, isSharePanelActive, isMini} = this.props;
        if (!track) return null;
        return (
            <div className="player">
                {options.width >= 350 && <PlayerArtwork track={track} showFollowButton={options.showFollowButton}/>}
                <div className="sound">
                    <div className="sound-header">
                        <PlayerButton color={getProperty(options, 'colors.playButton')} 
                                      track={track}
                                      isPlaying={isPlaying} 
                                      player={player}
                                      onClick={this.togglePlayback}/>
                        <MediaButtons data={track} 
                                      isMini={isMini}
                                      isPlayed={isPlayed} 
                                      options={options}
                                      onShareBtnClick={this.onShareBtnClick}
                                      isSharePanelActive={isSharePanelActive}/>
                        <PlayerTitle data={track}/>
                    </div>
                    <PlayerWaveForm
                        onSeek={this.onSeek}
                        onClick={this.onWaveFormClick}
                    />
                    <div className="sound-footer">
                        <TrackStats track={track} showPlayCount={options.showPlayCount}/>
                    </div>
                    <SharePanel
                        isActive={isSharePanelActive}
                        data={track} />
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
    isMini() {
        return this.props.options.height <= 100
    }
}

export default connect(state => ({
    isPlaying: state.isPlaying,
    isPlayed: state.isPlayed,
    track: state.track,
    options: state.options,
    player: state.player,
    isSharePanelActive: state.isSharePanelActive,
    isMini: state.isMini
}))(Player);