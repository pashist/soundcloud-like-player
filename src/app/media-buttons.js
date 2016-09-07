import React from 'react';
import ReactTooltip from 'react-tooltip';
import MediaButtonLike from './media-button-like';
import MediaButtonDownload from './media-button-download';
import MediaButtonBuy from './media-button-buy';
import MediaButtonShare from './media-button-share';
import {connect} from 'react-redux';

class MediaButtons extends React.Component {
    render() {
        return (
            <div className="media-buttons-wrapper">
                <div className="media-buttons">
                    {this.props.options.showLikeButton ? <MediaButtonLike /> : ''}
                    {this.props.options.showDownloadButton ? <MediaButtonDownload /> : ''}
                    {this.props.options.showBuyButton ? <MediaButtonBuy /> : ''}
                    {this.props.options.showShareButton ? <MediaButtonShare /> : ''}
                </div>
                <ReactTooltip effect="solid" class="button-tooltip"/>
            </div>
        )
    }
}

export default connect(state => ({
    options: state.options
}))(MediaButtons);