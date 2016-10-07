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
        let {height} = this.props.options;
        if (height && this.props.track) {
            let playerHeight = ReactDOM.findDOMNode(this.refs.player).offsetHeight;
            let playlistHeight = height - playerHeight;
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

    calcMinPlaylistHeight(){
        let trackHeight = 30;
        let minTracks = 3;
        let track = ReactDOM.findDOMNode(this.refs.player).querySelector('.playlist-item');
        if (track) {
            trackHeight = track.offsetHeight;
        }
        return trackHeight * minTracks;
    }
}
