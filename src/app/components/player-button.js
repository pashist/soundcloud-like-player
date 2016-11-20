import React from 'react';

export default class PlayerButton extends React.Component {
    render() {
        if (!this.props.track) return null;
        let colors = this.props.colors || {};
        let buttonColors = colors.playerButton || {};
        let colorStart = buttonColors.fill ? buttonColors.fill[0] || this.props.fill : colors.main;
        let colorStop = buttonColors.fill ? buttonColors.fill[1] || this.props.fill : colors.shade;
        let colorStroke = buttonColors.stroke || colors.darker;
        let className = 'play-button-wrapper';
        if (this.isDisabled()) {
            className += ' disabled'
        }
        return (
            <div className={className}>
                <div className="play-button" onClick={this.isDisabled() ? null : this.props.onClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43 43">
                        <defs>
                            <linearGradient id="scpPlayButtonGradient" x1="0%" y1="0%" x2="0%" y2="100%"
                                            spreadMethod="pad">
                                <stop offset="0%" stopColor={colorStart} stopOpacity="1"/>
                                <stop offset="100%" stopColor={colorStop} stopOpacity="1"/>
                            </linearGradient>
                        </defs>
                        <circle fill="url(#scpPlayButtonGradient)" stroke={colorStroke} cx="21.5" cy="21.5"
                                r="21"/>
                        <circle className="scpPlayButtonOverlay" fill="#000" fillOpacity="0.08"
                                stroke={colorStroke} cx="21.5" cy="21.5" r="21"/>
                        { this.props.isPlaying ? this.drawPause() : this.drawPlay() }

                    </svg>
                </div>
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

    isDisabled() {
        return !this.props.player
    }
}