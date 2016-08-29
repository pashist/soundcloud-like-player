import React from 'react';

export default class PlayerButton extends React.Component {
    render() {
        let gradientStart = this.props.color.fill[0] || this.props.fill;
        let gradientStop = this.props.color.fill[1] || this.props.fill;
        return (
            <div className="button" onClick={this.props.onClick}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43 43">
                    <defs>
                        <linearGradient id="scpPlayButtonGradient" x1="0%" y1="0%" x2="0%" y2="100%" spreadMethod="pad">
                            <stop offset="0%" stopColor={gradientStart} stopOpacity="1"/>
                            <stop offset="100%" stopColor={gradientStop} stopOpacity="1"/>
                        </linearGradient>
                    </defs>
                    <circle fill="url(#scpPlayButtonGradient)" stroke={this.props.color.stroke} cx="21.5" cy="21.5" r="21"/>
                    <circle className="scpPlayButtonOverlay" fill="#000" fillOpacity="0.08"
                            stroke={this.props.color.stroke} cx="21.5" cy="21.5" r="21"/>
                    { this.props.isPlaying ? this.drawPause() : this.drawPlay() }

                </svg>
            </div>
        )
    }

    drawPlay() {
        return <path className="button-play" fill="#fff" d="M31,21.5L17,33l2.5-11.5L17,10L31,21.5z"/>
    }

    drawPause() {
        return (
            <g fill="#fff" className="button-pause">
                <rect x="15" y="12" width="5" height="19"></rect>
                <rect x="23" y="12" width="5" height="19"></rect>
            </g>
        )
    }
}