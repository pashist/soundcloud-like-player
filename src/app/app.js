import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import Player from './components/player';
import PlayerVisual from './components/player-visual';
import Playlist from './components/playlist';
import CookiePolicy from './components/cookie-policy';
import * as actions from './actions';

import './css/fonts.css';
import './css/styles.scss';

@connect(state => ({
    isSingle: state.isSingle,
    track: state.track,
    options: state.options,
    isMini: state.isMini,
    isNarrow: state.isNarrow
}))

export default class App extends React.Component {
    componentDidMount() {
        this.updateSize();
    }

    componentDidUpdate() {
        this.updateSize();
    }

    render() {
        return (
            <div className={this.className()} style={this.style()}>
                {this.props.options.visual ? <PlayerVisual ref="player"/> : <Player ref="player"/>}
                {!this.props.isSingle && <Playlist ref="playlist"/>}
                <CookiePolicy />
            </div>
        )
    }

    updateSize() {
        let {options, track} = this.props;
        let player = ReactDOM.findDOMNode(this.refs.player);
        if (options.height && track && player) {
            let playerHeight = player.offsetHeight;
            let playlistHeight = options.height - playerHeight;
            let minPlaylistHeight = this.calcMinPlaylistHeight();
            this.props.dispatch(actions.setPlaylistHeight(Math.max(minPlaylistHeight, playlistHeight)));
        }
    }

    style() {
        let style = {};
        if (this.props.options.height && !this.props.isSingle) style.height = this.props.options.height;
        return style;
    }

    className() {
        let className = ['scl-player'];
        if (this.props.isMini) className.push('mini');
        if (this.props.isNarrow) className.push('narrow');
        className.push(this.props.isSingle ? 'single' : 'multi');
        className.push(this.props.options.visual ? 'visual' : 'default');
        return className.join(' ');
    }

    calcTrackHeight(){
        let trackHeight = 31; //default
        let track = ReactDOM.findDOMNode(this.refs.player).querySelector('.playlist-item');
        if (track) {
            trackHeight = track.offsetHeight;
        }
        this.props.dispatch(actions.setStateValue('trackHeight', trackHeight));
        return trackHeight;
    }
    
    calcMinPlaylistHeight(){
        let minTracks = 3;
        return this.calcTrackHeight() * minTracks;
    }
}
