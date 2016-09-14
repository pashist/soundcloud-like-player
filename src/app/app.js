import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import Player from './player';
import Playlist from './playlist';
import CookiePolicy from './cookie-policy';

import './fonts.css';
import './styles.css';


export class App extends React.Component {
    componentDidUpdate() {
        this.setHeight();
    }

    render() {
        let style = this.props.options.height && !this.props.isSingle ? {height: this.props.options.height }: {};
        return (
            <div className="scl-player" style={style}>
                <Player ref="player"/>
                {!this.props.isSingle && <Playlist ref="playlist" />}
                <CookiePolicy />
            </div>
        )
    }

    setHeight() {
        let height = this.props.options.height;
        if (height) {
            let playerHeight = ReactDOM.findDOMNode(this.refs.player).offsetHeight;
            let playlistHeight = height - playerHeight;
            ReactDOM.findDOMNode(this.refs.playlist).setAttribute('style', `height:${playlistHeight}px`);
            this.render();
        }
    }
}
export default connect(state => ({
    isSingle: state.isSingle
}))(App);
