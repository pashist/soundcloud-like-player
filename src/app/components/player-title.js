import React from 'react';
import ReactDOM from 'react-dom';

export default class PlayerTitle extends React.Component {
    componentDidMount() {
        //  window.addEventListener('resize', () => this.updateSize());
        //  this.updateSize();
    }

    render() {
        const track = this.props.data;
        const user = track.user;
        return (
            <div className="title-wrapper">
                <div className="title">
                    <div className="title-content" ref="titleContent">
                        <div className="user-link">
                            <a target="_blank" href={user.permalink_url}>{user.username}</a>
                        </div>
                        <div className="track-link">
                            <a target="_blank" href={track.permalink_url}>{track.title}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    updateSize() {
        this.refs.titleContent.setAttribute('style', `width:${ReactDOM.findDOMNode(this).offsetWidth}px`);
    }
}