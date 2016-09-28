import React from 'react';
import ReactTooltip from 'react-tooltip';
import MediaButtonLike from './media-button-like';
import MediaButtonDownload from './media-button-download';
import MediaButtonBuy from './media-button-buy';
import MediaButtonShare from './media-button-share';
import {connect} from 'react-redux';

export default class MediaButtons extends React.Component {
    render() {
        const {data, options, isPlayed, onShareBtnClick, isSharePanelActive, isVisual, isMini} = this.props;
        if (!data) return null;
        const isTrack = data.kind == 'track';
        return (
            <div className="media-buttons-wrapper">
                <div className="media-buttons">
                    {options.showLikeButton && isPlayed && isTrack && <MediaButtonLike data={data}/>}
                    {options.showDownloadButton && <MediaButtonDownload clientId={options.clientId} data={data}/>}
                    {options.showBuyButton && <MediaButtonBuy data={data}/>}
                    {options.showShareButton && !isMini && <MediaButtonShare
                        data={data}
                        onClick={onShareBtnClick}
                        isActive={isSharePanelActive}
                        isVisual={options.visual}/>}
                </div>
                <ReactTooltip effect="solid" class="button-tooltip" place="bottom" />
            </div>
        )
    }
}