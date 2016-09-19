import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

export default class MediaButtonBuy extends React.Component {
    componentDidUpdate(){
        ReactTooltip.rebuild();
    }
    render() {
        const {data} = this.props;
        if (!data || !data.purchase_url) return null;
        let url = data.purchase_url;
        return (
            <a className="media-button buy-button" href={url} target="_blank" data-tip="Buy">

            </a>
        )
    }
}