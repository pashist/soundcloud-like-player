import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

export class MediaButtonBuy extends React.Component {
    componentDidUpdate(){
        ReactTooltip.rebuild();
    }
    render() {
        if (!this.props.track || !this.props.track.purchase_url) return null;
        let url = this.props.track.purchase_url;
        return (
            <a className="media-button buy-button" href={url} target="_blank" data-tip="Buy">

            </a>
        )
    }
}

export default connect(state => ({
    track: state.tracks[state.index],
    options: state.options
}))(MediaButtonBuy);