import React from 'react';
import ReactDOM from 'react-dom';

export default class PlayerTitle extends React.Component {
    componentDidMount() {
        window.addEventListener('resize', () => this.updateSize());
        this.updateSize();
    }

    render() {
        let username = this.props.track ? this.props.track.user.username : '';
        let userUrl = this.props.track ? this.props.track.user.permalink_url : '';
        let trackTitle = this.props.track ? this.props.track.title : '';
        let trackUrl = this.props.track ? this.props.track.permalink_url : '';
        return (
            <div className="title">
                <div className="title-content" ref="titleContent">
                    <div className="user-link" >
                        {userUrl ? <a target="_blank" href={userUrl}>{username}</a> : username}
                    </div>
                    <div className="track-link">
                        {trackUrl ? <a target="_blank" href={trackUrl}>{trackTitle}</a> : trackTitle}
                    </div>
                </div>
            </div>
        )
    }

    updateSize() {
        this.refs.titleContent.setAttribute('style', `width:${ReactDOM.findDOMNode(this).offsetWidth}px`);
    }
}