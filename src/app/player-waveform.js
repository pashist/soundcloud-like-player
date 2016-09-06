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
        this.active = 0;
        this.selected = 0;
        this.timer = null;
        this.addColors();

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
    }

    componentDidMount() {
        window.addEventListener("resize", () => this.updateSize());
    }

    componentWillReceiveProps(nextProps) {
        //track switched or no waveform for current track
        if (nextProps.index != this.props.index || !this.waves.length) {
            let track = nextProps.tracks[nextProps.index];
            this.waves = this.interpolateWaveform(track && track.waveform);
        }
    }

    componentDidUpdate() {
        this.ctx = this.refs.canvas.getContext('2d');
        this.addColors();
        this.draw();
        clearInterval(this.timer);
        if (this.props.isPlaying) {
            this.timer = setInterval(this.draw.bind(this), 100)
        }
        this.updateSize();
    }

    render() {
        return (
            <div className={'waveform' + (this.props.isPlaying ? ' playing' : '')}
                 onMouseOver={this.onMouseOver.bind(this)}
                 onMouseMove={this.onMouseMove.bind(this)}
                 onMouseLeave={this.onMouseLeave.bind(this)}
                 onClick={this.onClick.bind(this)}
            >
                <canvas ref="canvas" width={this.width} height={this.height}/>
            </div>
        );
    }

    addColors() {
        this.setColor('wave-focus', '#333333');
        this.setGradient('wave', [0, '#666666', 1, '#868686']);
        this.setGradient('wave-active', [0, '#FF3300', 1, '#FF5100']);
        this.setGradient('wave-selected', [0, '#993016', 1, '#973C15']);
        this.setGradient('gutter', [0, '#666666', 1, '#c9c9c9']);
        this.setGradient('gutter-active', [0, '#FF3704', 1, '#FF8F63']);
        this.setGradient('gutter-selected', [0, '#9A371E', 1, '#CE9E8A']);
        this.setColor('reflection', '#999999');
        this.setColor('reflection-active', '#FFC0A0')
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
        this.active = this.getWaveIndexByTime();
        requestAnimationFrame(this.drawCanvas.bind(this))
    }

    drawCanvas() {
        let gutter, xPos, yPos;

        xPos = 0;
        yPos = this.offsetY;

        const ctx = this.ctx;

        // clear canvas for redraw
        this.ctx.clearRect(0, 0, this.width, this.height);

        // iterate waves
        for (let i = 0; i < this.waves.length; i += 1) {
            // wave

            // if is hovered
            if (this.selected > 0 && (this.selected <= i && i < this.active) || (this.selected > i && i >= this.active)) {

                this.ctx.fillStyle = this.colors['wave-selected']
            }
            // if is active
            else if (this.active > i) {
                this.ctx.fillStyle = this.colors['wave-active']
            }
            // default
            else {
                this.ctx.fillStyle = this.colors['wave-focus']
            }

            // draw wave
            this.ctx.fillRect(xPos, yPos, this.waveWidth, -this.waves[i]);


            // gutter

            // if is hovered
            if (this.selected > 0 && (this.selected <= i && i < this.active) || (this.selected > i && i >= this.active)) {
                this.ctx.fillStyle = this.colors['gutter-selected']
            }
            // if is active
            else if (this.active > i) {
                this.ctx.fillStyle = this.colors['gutter-active']
            }
            // default
            else {
                this.ctx.fillStyle = this.colors['gutter']
            }

            // smallest wave between butter is gutters height
            // note: Math.max because wave values are negative
            let gutterHeight = Math.min(this.waves[i], this.waves[i + 1]);

            // draw gutter
            this.ctx.fillRect(xPos + this.waveWidth, yPos, this.gutterWidth, -gutterHeight);


            // reflection wave
            if (this.reflection > 0) {
                let reflectionHeight = (Math.abs(this.waves[i]) / (1 - this.reflection) ) * this.reflection;
                if (this.active > i) ctx.fillStyle = this.colors['reflection-active'];
                else this.ctx.fillStyle = this.colors['reflection'];
                // draw reflection
                this.ctx.fillRect(xPos, yPos, this.waveWidth, reflectionHeight)
            }
            xPos += this.waveWidth + this.gutterWidth
        }

        //draw time
        this.drawTime('currentTime', this.secToMin(this.getCurrentTime()));
        this.drawTime('duration', this.secToMin(this.getDuration()));
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
        this.width = ReactDOM.findDOMNode(this).offsetWidth;
        this.height = ReactDOM.findDOMNode(this).offsetHeight;
        this.offsetY = Math.round(this.height * (1 - this.reflection));
        this.wavesCount = Math.round(this.width / (this.waveWidth + this.gutterWidth));
        this.calculateWaves();
        this.refs.canvas.setAttribute('width', this.width);
        this.refs.canvas.style.display = display;
        this.draw();
    }

    calculateWaves() {
        let waveform = this.props.tracks.length && this.props.tracks[this.props.index].waveform;
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
        this.active = this.getWaveIndexByCoords(e);
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
    getDuration(){
       try {
           return this.props.player.audio.duration;
       } catch(e) {
           return null;
       }
    }
    getCurrentTime(){
        try {
            return this.props.player.audio.currentTime;
        } catch(e) {
            return null;
        }
    }
}

export default connect(state => state)(PlayerWaveForm);