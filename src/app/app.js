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
    options: state.options
}))

export default class App extends React.Component {
    componentDidMount() {
        this.updateHeight();
    }

    componentDidUpdate() {
        this.updateHeight();
    }

    render() {
        let className = 'scl-player';
        if (this.props.options.visual) className += ' visual';
        className += this.props.isSingle ? ' single' : ' multi';
        return (
            <div className={className} style={this.computeStyle()}>
                {this.props.options.visual ? <PlayerVisual ref="player"/> : <Player ref="player"/>}
                {!this.props.isSingle && <Playlist ref="playlist"/>}
                <CookiePolicy />
            </div>
        )
    }

    updateHeight() {
        let {height} = this.props.options;
        if (height && !this.props.options.visual && this.props.track) {
            let playerHeight = ReactDOM.findDOMNode(this.refs.player).offsetHeight;
            let playlistHeight = height - playerHeight;
            this.props.dispatch(actions.setPlaylistHeight(playlistHeight));
        }
    }

    computeStyle() {
        let style = {};
        if (this.props.options.height && !this.props.isSingle) style.height = this.props.options.height;
        return style;
    }
}
