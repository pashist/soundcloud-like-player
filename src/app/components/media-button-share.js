import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import {toggleSharePanel} from '../actions'

export default class MediaButtonShare extends React.Component {
    componentWillReceiveProps(props){
        ReactTooltip.rebuild();
        const {isActive, isVisual} = props;
        if (isVisual && isActive) {
            ReactTooltip.hide();
        }
    }
    render() {
        const {data, isActive, onClick, isVisual} = this.props;
        if (!data) return null;
        let className = 'media-button share-button' + (isActive ? ' active' : '');
        let buttonText = isActive && !isVisual ? 'Hide share options' : 'Share';
        return (
            <button className={className} onClick={onClick} data-tip={isVisual && isActive ? null : buttonText}>
                {buttonText}
            </button>
        )
    }
}