import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

export default class MediaButtonDownload extends React.Component {
    componentDidUpdate(){
        ReactTooltip.rebuild();
    }
    render() {
        const {data, clientId} = this.props;
        if (!data || !data.download_url || !data.downloadable) return null;
        let url = data.download_url + '?client_id=' + clientId;
        return (
            <a className="media-button download-button" href={url} data-tip="Download">
                
            </a>
        )
    }
}