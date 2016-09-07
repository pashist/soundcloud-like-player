import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import {actionToggleShareButton} from './store'

export class MediaButtonShare extends React.Component {
    componentDidUpdate(){
        ReactTooltip.rebuild();
    }
    render() {
        if (!this.props.track) return null;
        let className = 'media-button share-button' + (this.props.shareButtonActive ? ' active' : '');
        let buttonText = this.props.shareButtonActive ? 'Hide share options' : 'Share';
        return (
            <button className={className} onClick={this.onClick.bind(this)} data-tip={buttonText}>
                {buttonText}
            </button>
        )
    }
    onClick(){
        this.props.dispatch(actionToggleShareButton())
    }
}

export default connect(state => ({
    track: state.tracks[state.index],
    shareButtonActive: state.shareButtonActive
}))(MediaButtonShare);