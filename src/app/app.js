import React from 'react';
import Player from './player';
import Playlist from './playlist';
import './styles.css';

export default class App extends React.Component {
    render() {
        return (
            <div className="scl-player">
                <Player/>
                <Playlist/>
            </div>
        )
    }
}
