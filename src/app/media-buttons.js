import React from 'react';
import MediaButtonLike from './media-button-like';
import MediaButtonDownload from './media-button-download';
import MediaButtonBuy from './media-button-buy';
import {connect} from 'react-redux';

class MediaButtons extends React.Component {
    render() {
        return (
            <div className="media-buttons-wrapper">
                <div className="media-buttons">
                    {this.props.options.showLikeButton ? <MediaButtonLike /> : ''}
                    {this.props.options.showDownloadButton ? <MediaButtonDownload /> : ''}
                    {this.props.options.showBuyButton ? <MediaButtonBuy /> : ''}
                </div>
            </div>
        )
    }
}

export default connect(state => state)(MediaButtons);