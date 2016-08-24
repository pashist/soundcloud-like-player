import React from 'react';
import Player from './player';
import Playlist from './playlist';
import './styles.css';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.player = this.props.player;
        
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <div className="scl-player">
                <Player/>
                <Playlist/>
            </div>
        )
    }
}
