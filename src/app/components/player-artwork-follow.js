import React from 'react';
import {connect} from 'react-redux';
import * as actions from '../actions';

export class PlayerArtworkFollow extends React.Component {

    componentWillReceiveProps() {
        this.props.dispatch(actions.fetchFollowingsIfNeeded());
    }

    render() {
        if (!this.props.track) {
            return null;
        }
        let className = 'follow' + (this.isFollowing() ? ' active' : '');
        let buttonText = this.isFollowing() ? 'Following' : 'Follow';
        return (
            <div className={className}>
                <button tabIndex="0" onClick={this.onClick.bind(this)}>{buttonText}</button>
            </div>
        )
    }

    onClick() {
        this.props.dispatch(actions.followRequest(this.props.track.user_id, !this.isFollowing()));
    }

    isFollowing() {
        return this.props.followings
            && this.props.track
            && this.props.followings.data.indexOf(this.props.track.user_id) !== -1
    }
}

export default connect(state => ({
    track: state.tracks[state.index],
    followings: state.followings
}))(PlayerArtworkFollow);