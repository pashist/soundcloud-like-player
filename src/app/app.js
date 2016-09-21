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
    track: state.track
}))

export default class App extends React.Component {
    componentDidUpdate() {
        !this.props.options.visual && this.props.track && this.setHeight();
    }

    render() {
        let style = this.props.options.height && !this.props.isSingle ? {height: this.props.options.height} : {};
        let className = 'scl-player';
        if (this.props.options.visual) className += ' visual';
        className += this.props.isSingle ? ' single' : ' multi';
        return (
            <div className={className} style={style}>
                {this.props.options.visual && <PlayerVisual ref="player"/>}
                {!this.props.options.visual && <Player ref="player"/>}
                {!this.props.isSingle && <Playlist ref="playlist"/>}
                <CookiePolicy />
            </div>
        )
    }

    setHeight() {
        let {height} = this.props.options;
        if (height) {
            let playerHeight = ReactDOM.findDOMNode(this.refs.player).offsetHeight;
            let playlistHeight = height - playerHeight;
            this.props.dispatch(actions.setPlaylistHeight(playlistHeight));
        }
    }
}
