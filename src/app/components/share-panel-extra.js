import React from 'react';
import {connect} from 'react-redux';
import SharePanelEmbedCode from './share-panel-embed-code';
import SharePanelLink from './share-panel-link';
import * as actions from '../actions';

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
        this.props.dispatch(actions.toggleEmbedCode())
    }

    toggleWP() {
        this.props.dispatch(actions.toggleEmbedCodeWordpress())
    }
}

export default connect(state => ({
    track: state.track,
    isEmbedCodeVisible: state.isEmbedCodeVisible,
    isEmbedCodeWordpress: state.isEmbedCodeWordpress
}))(SharePanelExtra);