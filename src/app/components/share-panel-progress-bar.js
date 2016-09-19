import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import * as actions from '../actions';

export class SharePanelProgressBar extends React.Component {
    render() {
        if (!this.props.track) return null;
        let playedWidth = this.calculatePlayedWidth();
        return (
            <div className="progress-bar" onClick={this.onClick.bind(this)}>
                <div className="played" style={{width: playedWidth + '%'}}></div>
            </div>
        )
    }

    onClick(e) {
        if (this.props.isPlaying) {
            let selfNode = ReactDOM.findDOMNode(this);
            let width = selfNode.offsetWidth;
            let x = e.clientX - selfNode.getBoundingClientRect().left;
            let time = x / width * this.props.track.duration;
            this.props.dispatch(actions.setTrackCurrentTime(time))
        } else {
            this.props.dispatch(actions.play())
        }
    }

    calculatePlayedWidth() {
        return (this.props.currentTime / this.props.track.duration) * 100;
    }

}

export default connect(state => ({
    track: state.track,
    currentTime: state.currentTime,
    isPlaying: state.isPlaying
}))(SharePanelProgressBar);