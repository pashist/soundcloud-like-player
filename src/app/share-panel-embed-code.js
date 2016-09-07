import React from 'react';
import {connect} from 'react-redux';

export default class SharePanelEmbedCode extends React.Component {
    render() {
        if (!this.props.track) return null;
        return (
            <div className="share-link">
                <div className="right">
                    <input type="checkbox" id="embed-code-wordpress" onClick={this.props.toggleWP}
                           checked={this.props.isEmbedCodeWordpress}/>
                    <label for="embed-code-wordpress">WordPress</label>
                    <button className="share-embed-code-button" onClick={this.props.onClick}>Link</button>
                </div>
                <div className="input-wrapper">
                    <input className="share-link-input" type="text" readOnly="readonly"
                           value={this.buildEmbedCode()}/>
                </div>
            </div>
        )
    }

    buildEmbedCode() {
        return this.props.isEmbedCodeWordpress
            ? `[soundcloud url="${this.props.track.uri}" params="color=ff5500" width="100%" height="166" iframe="true" /]`
            : `<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=${this.props.track.permalink_url}&amp;color=ff5500"></iframe>`
    }
}