import React from 'react';
import {connect} from 'react-redux';

export class MediaButtonDownload extends React.Component {
    render() {
        if (!this.props.track || !this.props.track.download_url || !this.props.track.downloadable) return null;
        let url = this.props.track.download_url + '?client_id=' + this.props.options.clientId;
        return (
            <a className="media-button download-button" href={url}>
                
            </a>
        )
    }
}

export default connect(state => ({
    track: state.tracks[state.index],
    options: state.options
}))(MediaButtonDownload);