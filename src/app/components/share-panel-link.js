import React from 'react';

export default class SharePanelLink extends React.Component {
    render() {
        if (!this.props.track) return null;
        return (
            <div className="share-link">
                <div className="right">
                    <button className="share-link-button" onClick={this.props.onClick}>Embed</button>
                </div>
                <div className="input-wrapper">
                    <input type="text" readOnly="readonly" onClick={this.onClick.bind(this)} value={this.props.track.permalink_url}/>
                </div>
            </div>
        )
    }
    onClick(e) {
        e.target.select();
    }
}