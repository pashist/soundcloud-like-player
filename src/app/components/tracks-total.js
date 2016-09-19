import React from 'react';
import numscale from 'numscale';

export default class TrackTotal extends React.Component {
    render() {
        return (
            <div className="tracks-total-wrapper">
                <div className="tracks-total">
                    <div className="tracks-total-number">{this.props.value}</div>
                    <div className="tracks-total-text">tracks</div>
                </div>
            </div>
        )
    }
}