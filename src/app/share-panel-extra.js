import React from 'react';
import {connect} from 'react-redux';
import SharePanelEmbedCode from './share-panel-embed-code';
import SharePanelLink from './share-panel-link';
import {actionToggleEmbedCode, actionToggleEmbedCodeWordpress} from './store';

export class SharePanelExtra extends React.Component {
    render() {
        if (!this.props.track) return null;
        return (
            <div className="share-panel-extra">
                {this.props.isEmbedCodeVisible
                    ? <SharePanelEmbedCode track={this.props.track}
                                           isEmbedCodeWordpress={this.props.isEmbedCodeWordpress}
                                           onClick={this.onClick.bind(this)}
                                           toggleWP={this.toggleWP.bind(this)}/>
                    : <SharePanelLink track={this.props.track} onClick={this.onClick.bind(this)}/>
                }
            </div>
        )
    }

    onClick(e) {
        this.props.dispatch(actionToggleEmbedCode())
    }

    toggleWP() {
        this.props.dispatch(actionToggleEmbedCodeWordpress())
    }
}

export default connect(state => ({
    track: state.track,
    isEmbedCodeVisible: state.isEmbedCodeVisible,
    isEmbedCodeWordpress: state.isEmbedCodeWordpress
}))(SharePanelExtra);