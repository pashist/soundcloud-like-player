import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import * as actions from '../actions';

class MediaButtonLike extends React.Component {

    componentDidUpdate(){
        ReactTooltip.rebuild();
    }
    render() {
        if (!this.props.track) return null;
        let className = 'like-button media-button';
        if (this.isLiked()) {
            className += ' active';
        }
        return (
            <div className={className} onClick={this.onClick.bind(this)} data-tip={this.isLiked() ? 'Liked' : 'Like'}>

            </div>
        )
    }

    onClick() {
        let trackId = this.props.track.id;
        this.props.dispatch(
            this.isLiked() ? actions.trackUnlikeRequest(trackId) : actions.trackLikeRequest(trackId)
        );
    }
    
    isLiked(){
        return this.props.likes && this.props.likes[this.props.track.id] && this.props.likes[this.props.track.id].value
    }
}

export default connect(state => ({
    track: state.track,
    likes: state.likes
}))(MediaButtonLike);