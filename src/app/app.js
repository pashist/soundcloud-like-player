import React from 'react';
import ReactDOM from 'react-dom';
import Player from './player';
import Playlist from './playlist';
import CookiePolicy from './cookie-policy';
import './styles.css';

export default class App extends React.Component {
    componentDidMount(){
        this.setHeight();
    }
    render() {
        return (
            <div className="scl-player" style={this.props.options.height ? {height: this.props.options.height }: {}}>
                <Player ref="player"/>
                <Playlist ref="playlist"/>
                <CookiePolicy />
            </div>
        )
    }

    setHeight(){
        let height = this.props.options.height;
        if (height) {
            let playerHeight = ReactDOM.findDOMNode(this.refs.player).offsetHeight;
            let playlistHeight = height - playerHeight;
            ReactDOM.findDOMNode(this.refs.playlist).setAttribute('style', `height:${playlistHeight}px`);
            this.render();
        }
    }
}
