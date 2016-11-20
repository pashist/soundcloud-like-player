import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';

class PlayerWaveForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            color: 'red'
        };
        this.colors = [];
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.waves = [];
        this.waveform = null;
        this.width = 0;
        this.height = 0;
        this.offsetY = 0;
        this.waveWidth = 2;
        this.gutterWidth = 1;
        this.wavesCount = 0;
        this.reflection = 0.3;
        this.played = 0;
        this.selected = 0;
        this.timer = null;

        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 30);
                }
        })();

        this.drawCanvas = this.drawCanvas.bind(this);
        this.draw = this.draw.bind(this);
        this.updateSize = this.updateSize.bind(this);
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateSize);
        this.init();
    }

    componentWillReceiveProps(nextProps) {
        //track switched or no waveform for current track
        if (nextProps.track != this.props.track || !this.waves.length) {
            let track = nextProps.track;
            this.waves = this.interpolateWaveform(track && track.waveform);
        }
    }

    componentDidUpdate() {
        this.init();
    }

    init() {
        this.ctx = this.refs.canvas.getContext('2d');
        this.updateSize();
        this.addColors();
        clearInterval(this.timer);
        if (this.props.isPlaying) {
            this.timer = setInterval(this.draw, 100);
        }
    }

    render() {
        return (
            <div className="waveform-wrapper">
                <div className={'waveform' + (this.props.isPlaying ? ' playing' : '')}
                     onMouseOver={this.onMouseOver.bind(this)}
                     onMouseMove={this.onMouseMove.bind(this)}
                     onMouseLeave={this.onMouseLeave.bind(this)}
                     onClick={this.onClick.bind(this)}
                >
                    <canvas ref="canvas" width={this.width} height={this.height}/>
                </div>
            </div>
        );
    }

    addColors() {
        if (this.props.visual) {
            let bgBrightness = this.rgbToHsl(...this.props.mainColor)[2];
            bgBrightness < 0.5 ? this.addColorsLight() : this.addColorsDefault();
        } else {
            this.addColorsCustom();
        }
    }

    isCustomColors() {
        return true;
    }

    addColorsDefault() {
        this.setColor('wave-focus', '#333333');
        this.setGradient('wave', [0, 'rgb(51,51,51)', 1, 'rgb(51,51,51)']);
        this.setGradient('wave-played', [0, 'rgb(255,51,0)', 1, 'rgb(255,85,0)']);
        this.setGradient('wave-selected', [0, 'rgb(153,51,26)', 1, 'rgb(153,69,26)']);
        this.setGradient('gutter', [0, 'rgb(51,51,51)', 0.5, 'rgba(82,82,82,0.5)', 1, 'rgba(102,102,102,0.1)']);
        this.setGradient('gutter-played', [0, 'rgba(255,51,0,1)', 1, 'rgba(255,85,0,0.1)']);
        this.setGradient('gutter-selected', [0, 'rgba(153,51,26,1)', 1, 'rgba(153,69,26,0.1)']);
        this.setColor('reflection', '#999999');
        this.setColor('reflection-played', '#FFC0A0')
    }

    addColorsCustom() {
        let colors = this.props.colors;
        let mixed = this.rgbaMix([51,51,51,1], this.hexToRgb(colors.main, 0.5));
        this.setColor('wave', 'rgb(51,51,51)');
        this.setColor('wave-played', colors.main);
        this.setColor('wave-selected', 'rgba(' + mixed.join() + ')');
        this.setGradient('gutter', [0, 'rgba(51,51,51,1)', 0.4, 'rgba(82,82,82,0.6)', 1, 'rgba(102,102,102,0)']);
        this.setGradient('gutter-played', [0, this.hexToRgbString(colors.main, 1), 0.4, this.hexToRgbString(colors.main, 0.6), 1, this.hexToRgbString(colors.main, 0)]);
        this.setGradient('gutter-selected', [
            0, 'rgba(' + mixed.join() + ')',
            0.4, 'rgba(' + mixed.slice(0, 3).join() + ',0.6)',
            1, 'rgba(' + mixed.slice(0, 3).join() + ',0)'
        ]);

        this.setColor('reflection', 'rgba(51,51,51,0.5)');
        this.setColor('reflection-played', '#FFC0A0');
        this.setColor('reflection-gutter', 'rgba(51,51,51,0.125)');
        this.setColor('reflection-gutter-played', '#FFC0A0');
    }

    addColorsLight() {
        this.setColor('wave-focus', [0, 'rgb(255,255,255)'], [.7, 'rgb(255,255,255)'], [.701, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0.5)']);
        this.setGradient('wave', [0, '#FFFFFF', 1, '#FFFFFF']);
        this.setGradient('wave-played', [0, 'rgb(255,51,0)', 1, 'rgb(255,85,0)']);
        this.setGradient('wave-selected', [0, 'rgb(255,153,128)', 1, 'rgb(255,171,128)']);
        this.setGradient('gutter', [0, 'rgba(255,255,255,0.5)', 1, 'rgba(255,255,255,0.125)']);
        this.setGradient('gutter-played', [0, 'rgba(255,51,0,0.5)', 1, 'rgba(255,85,0,0.125)']);
        this.setGradient('gutter-selected', [0, 'rgba(255,153,128,0.5)', 1, 'rgba(255,171,128,0.125)']);
        this.setColor('reflection', '#999999');
        this.setColor('reflection-played', '#FFC0A0');
    }

    setColor(name, color) {
        this.colors[name] = color
    }

    setGradient(name, colors) {
        var gradient = this.ctx.createLinearGradient(0, this.offsetY, 0, 0);
        for (var i = 0; i < colors.length; i += 2) {
            gradient.addColorStop(colors[i], colors[i + 1])
        }
        this.colors[name] = gradient;
    }

    draw() {
        this.played = this.getWaveIndexByTime();
        requestAnimationFrame(this.drawCanvas)
    }

    drawCanvas() {
        //const ratio = window.devicePixelRatio;
        const waveWidth = Math.floor(this.waveWidth/* * ratio*/);
        const gutterWidth = Math.floor(this.gutterWidth /* ratio*/);
        const width = Math.floor(this.width/* * ratio*/);
        const height = Math.floor(this.height/* * ratio*/);

        let gutter, xPos, yPos;

        xPos = 0;
        yPos = this.offsetY;

        const ctx = this.ctx;

        // clear canvas for redraw
        this.ctx.clearRect(0, 0, width, height);

        // iterate waves
        for (let i = 0; i < this.waves.length; i += 1) {
            // wave

            // if is hovered
            if (this.selected > 0 && (this.selected <= i && i < this.played) || (this.selected > i && i >= this.played)) {

                this.ctx.fillStyle = this.colors['wave-selected']
            }
            // if is active
            else if (this.played > i) {
                this.ctx.fillStyle = this.colors['wave-played']
            }
            // default
            else {
                this.ctx.fillStyle = this.colors['wave']
            }

            // draw wave
            this.ctx.fillRect(xPos, yPos, waveWidth, -this.waves[i]);


            // gutter

            // if is hovered
            if (this.selected > 0 && (this.selected <= i && i < this.played) || (this.selected > i && i >= this.played)) {
                this.ctx.fillStyle = this.colors['gutter-selected']
            }
            // if is active
            else if (this.played > i) {
                this.ctx.fillStyle = this.colors['gutter-played']
            }
            // default
            else {
                this.ctx.fillStyle = this.colors['gutter']
            }

            // smallest wave between butter is gutters height
            // note: Math.max because wave values are negative
            let gutterHeight = Math.min(this.waves[i], this.waves[i + 1]);

            // draw gutter
            this.ctx.fillRect(xPos + waveWidth, yPos, gutterWidth, -gutterHeight);


            // reflection wave
            if (this.reflection > 0) {

                let reflectionHeight = (Math.abs(this.waves[i]) / (1 - this.reflection) ) * this.reflection;
                this.ctx.fillStyle = this.played > i ? this.colors['wave-played'] : this.colors['wave'];
                // draw reflection
                this.ctx.globalAlpha = 0.4;
                this.ctx.fillRect(xPos, yPos, waveWidth, reflectionHeight);
                this.ctx.globalAlpha = 1;

            }
            xPos += waveWidth + gutterWidth
        }

        //draw time
        if (this.props.track) {
            if (this.props.isPlayed) {
                this.drawTime('currentTime', this.secToMin(this.getCurrentTime() / 1000));
            }
            this.drawTime('duration', this.secToMin(this.getDuration() / 1000));
        }

    }

    drawTime(type, time) {
        let fontSize = 10;
        let textWidth = this.ctx.measureText(time).width;
        let textColor = type == 'duration' ? 'gray' : 'darkorange';

        let bgWidth = textWidth + 4;
        let bgHeight = fontSize + 4;
        let bgX = type == 'duration' ? this.width - textWidth - 4 : 0;
        let bgY = this.offsetY - bgHeight;

        let textX = bgX + 2;
        let textY = bgY + fontSize;

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
        this.ctx.fillStyle = textColor;
        this.ctx.font = `normal ${fontSize}px Arial`;
        this.ctx.fillText(time, textX, textY);
    }

    interpolateArray(data, fitCount) {
        let after = undefined;
        let atPoint = undefined;
        let before = undefined;
        let i = 1;
        let newData = [];
        let springFactor = Number((data.length - 1) / (fitCount - 1));
        let tmp;
        newData[0] = data[0];
        while (i < fitCount - 1) {
            tmp = i * springFactor;
            before = Number(Math.floor(tmp)).toFixed();
            after = Number(Math.ceil(tmp)).toFixed();
            atPoint = tmp - before;
            newData[i] = this.linearInterpolate(data[before], data[after], atPoint);
            i++;
        }
        newData[fitCount - 1] = data[data.length - 1];
        return newData
    }

    linearInterpolate(before, after, atPoint) {
        return before + (after - before) * atPoint;
    }

    interpolateWaveform(data) {
        if (data) {
            return this.interpolateArray(data.samples, this.wavesCount)
                .map(wave => Math.round(this.offsetY * (wave / data.height)))
        } else {
            return [];
        }
    }

    updateSize() {
        const display = this.refs.canvas.style.display;
        this.refs.canvas.style.display = 'none';
        this.width = ReactDOM.findDOMNode(this).querySelector('.waveform').offsetWidth;
        this.height = ReactDOM.findDOMNode(this).querySelector('.waveform').offsetHeight;
        this.offsetY = Math.round(this.height * (1 - this.reflection));
        this.wavesCount = Math.round(this.width / (this.waveWidth + this.gutterWidth));
        this.calculateWaves();
        this.refs.canvas.removeAttribute('style');
        this.refs.canvas.setAttribute('width', this.width);
        this.refs.canvas.setAttribute('height', this.height);
        this.refs.canvas.style.display = display;
        if (window.devicePixelRatio / 2 >= 1) {
            this.refs.canvas.width = this.width * window.devicePixelRatio;
            this.refs.canvas.height = this.height * window.devicePixelRatio;
            this.refs.canvas.setAttribute('style', `width:${this.width}px; height:${this.height}px`);
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        this.draw();
    }

    calculateWaves() {
        let waveform = this.props.track && this.props.track.waveform;
        this.waves = this.interpolateWaveform(waveform);
    }

    onMouseOver(e) {
        // console.log(e.clientX);
    }

    onMouseMove(e) {
        this.selected = this.getWaveIndexByCoords(e);
        this.draw();
    }

    onMouseLeave() {
        this.selected = null;
        this.draw();
    }

    onClick(e) {
        this.played = this.getWaveIndexByCoords(e);
        this.draw();
        this.props.onClick();
        this.props.onSeek(this.getTrackTimeByCoords(e));
    }

    getWaveIndexByCoords(e) {
        let self = ReactDOM.findDOMNode(this);
        let width = self.offsetWidth;
        let x = e.clientX - self.getBoundingClientRect().left;
        let index = Math.floor(x / width * this.wavesCount);
        return index;
    }

    getWaveIndexByTime() {
        let duration = this.getDuration();
        let time = this.getCurrentTime();
        if (this.props.player) {
            return Math.ceil(time / duration * this.waves.length)
        } else {
            return -1;
        }
    }

    getTrackTimeByCoords(e) {
        let duration = this.getDuration();
        let active = this.getWaveIndexByCoords(e);
        let time = active / this.wavesCount * duration;
        return time || 0;
    }

    secToMin(time) {
        let _time = time || 0;
        var minutes = Math.floor(_time / 60);
        var seconds = "0" + Math.floor(_time - minutes * 60);
        return minutes + "." + seconds.substr(-2);
    };

    getDuration() {
        try {
            return this.props.track.duration;
        } catch (e) {
            return null;
        }
    }

    getCurrentTime() {
        try {
            let time = this.props.player instanceof HTMLAudioElement
                ? this.props.player.currentTime * 1000
                : this.props.player.currentTime();
            return time;
        } catch (e) {
            return null;
        }
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSL representation
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    hexToRgb(hex, alpha) {
        let bigint = parseInt(hex.replace(/[^0-9A-F]/gi, ''), 16);
        let result = [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255];
        if (typeof alpha !== 'undefined') {
            result.push(alpha)
        }
        return result;
    }
    hexToRgbString(hex, alpha) {
        let rgb = this.hexToRgb(hex, alpha);
        return (typeof alpha !== 'undefined') ? 'rgba(' + rgb.join() + ')' : 'rgb(' + rgb.join() + ')';
    }
    rgbaMix(base, over) {
        var mix = [];
        mix[3] = 1 - (1 - over[3]) * (1 - base[3]); // alpha
        mix[0] = Math.round((over[0] * over[3] + base[0] * base[3] * (1 - over[3])) / mix[3]); // red
        mix[1] = Math.round((over[1] * over[3] + base[1] * base[3] * (1 - over[3])) / mix[3]); // green
        mix[2] = Math.round((over[2] * over[3] + base[2] * base[3] * (1 - over[3])) / mix[3]); // blue
        return mix;
    }
}

export default connect(state => ({
    player: state.player,
    track: state.track,
    isPlaying: state.isPlaying,
    isPlayed: state.isPlayed,
    mainColor: state.mainColor,
    visual: state.options.visual,
    colors: state.options.colors
}))(PlayerWaveForm);