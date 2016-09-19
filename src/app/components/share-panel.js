import React from 'react';
import {connect} from 'react-redux';
import SharePanelItems from './share-panel-items';
import SharePanelProgressBar from './share-panel-progress-bar';
import SharePanelExtra from './share-panel-extra';

import {toggleSharePanel} from '../actions'

export class SharePanel extends React.Component {
    render() {
        if (!this.props.track) return null;
        let className = 'share-panel' + (this.props.isSharePanelActive ? ' active' : '');
        return (
            <div className={className}>
                <SharePanelProgressBar />
                <SharePanelItems track={this.props.track} />
                <SharePanelExtra />
            </div>
        )
    }

    onClick() {
        this.props.dispatch(toggleSharePanel())
    }
}

export default connect(state => ({
    track: state.track,
    isSharePanelActive: state.isSharePanelActive,
    isEmbedCodeVisible: state.isEmbedCodeVisible
}))(SharePanel);