import React from 'react';
import {connect} from 'react-redux';
import SharePanelItems from './share-panel-items';
import SharePanelProgressBar from './share-panel-progress-bar';
import SharePanelExtra from './share-panel-extra';

import {toggleSharePanel} from '../actions'

export default class SharePanel extends React.Component {
    render() {
        if (!this.props.data) return null;
        let className = 'share-panel' + (this.props.isActive ? ' active' : '');
        return (
            <div className={className}>
                <SharePanelProgressBar />
                <SharePanelItems data={this.props.data} />
                <SharePanelExtra />
            </div>
        )
    }

    onClick() {
        this.props.dispatch(toggleSharePanel())
    }
}