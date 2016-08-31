import React from 'react';
import {connect} from 'react-redux';
import {actionTrackLikeRequest, actionTrackUnlikeRequest, actionTrackLikeStatusRequest} from './store';

class MediaButtonLike extends React.Component {
    componentWillReceiveProps(props){
        if (typeof props.likes[props.track.id] === 'undefined') {
            this.props.dispatch(actionTrackLikeStatusRequest(props.track.id));
        }
    }
    render() {
        if (!this.props.track) return null;
        let className = 'like-button media-button';
        if (this.isLiked()) {
            className += ' active';
        }
        return (
            <div className={className} onClick={this.onClick.bind(this)}>

            </div>
        )
    }

    onClick() {
        let trackId = this.props.track.id;
        this.props.dispatch(
            this.isLiked() ? actionTrackUnlikeRequest(trackId) : actionTrackLikeRequest(trackId)
        );
    }
    
    isLiked(){
        return this.props.likes && this.props.likes[this.props.track.id] && this.props.likes[this.props.track.id].value
    }
}

export default connect(state => ({
    track: state.tracks[state.index],
    likes: state.likes
}))(MediaButtonLike);