import SC from 'soundcloud';
import SoundCloudAudio from 'soundcloud-audio';
import {merge} from 'lodash';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './app/app';
import {Provider} from 'react-redux';
import store, {
    actionPlay,
    actionPause,
    actionStop,
    actionSetTracks,
    actionSetTrack,
    actionNext,
    actionSetPlayer,
    actionSetApi,
    actionAddTracks,
    actionSetOptions
} from './app/store';

export default class SoundCloudLikePlayer {
    
    constructor(opts) {
        this.options = this.parseOptions(opts);
        this.player = new SoundCloudAudio(this.options.clientId);
        this.api = window.SC = SC;
        
        SC.connect2 = () => SC.connect().then(result => {
            localStorage.setItem('SC_OAUTH_TOKEN', result.oauth_token);
            return result;
        });

        SC.initialize({
            client_id: this.options.clientId,
            redirect_uri: this.options.redirectUri,
            oauth_token: localStorage.getItem('SC_OAUTH_TOKEN')
        });
        
        store.dispatch(actionSetPlayer(this.player));
        store.dispatch(actionSetOptions(this.options));
        store.dispatch(actionSetApi(this.api));

        this.app = ReactDOM.render(
            <Provider store={store}><App options={this.options} /></Provider>, this.options.container
        );

    }
    get defaults(){
        return {
            id: 'scp_' + Math.random(),
            autoplay: false,
            colors: {
                playButton: {
                    fill: ['#ff5500', '#ff2200'],
                    stroke: '#cc4400'
                },
                playlist: {
                    track: '#333',
                    trackActive:  '#ff5500'
                }
            },
            width: 'auto',
            height: null
        };
    }
    
    parseOptions(data) {
        let options = merge(this.defaults, data instanceof Object ? data : {});

        if (!options.container) {
            throw new Error('Parameter `container` required');
        }
        if (!options.container instanceof HTMLElement) {
            throw new Error('Parameter `container` invalid');
        }
        if (!options.clientId) {
            throw new Error('Parameter `clientId` required');
        }
        if (!options.height) {
            options.height = options.container.offsetHeight
        }
        return options;
    }

    resolve(url) {
        return new Promise((resolve, reject) => {
            try {
                this.player.resolve(url, data => {
                    let tracks = data instanceof Array
                        ? data : data.kind == 'playlist'
                        ? data.tracks : data.kind == 'track'
                        ? [data] : [];
                    store.dispatch(actionSetTracks(tracks));
                    store.dispatch(actionSetTrack(0, this.options.autoplay));
                    resolve(data);
                })
            } catch (err) {
                reject(err);
            }
        });
    }

    search(params, clear = true) {
        return this.player.search(params, clear)
            .then(data => {
                let tracks = data instanceof Array ? data : [];
                if (clear) {
                    store.dispatch(actionSetTracks(tracks));
                    store.dispatch(actionSetTrack(0, this.options.autoplay));
                } else {
                    store.dispatch(actionAddTracks(tracks));
                }
                return data;
            })
    }

    play(args) {
        store.dispatch(actionPlay(args))
    }

    pause() {
        store.dispatch(actionPause())
    }

    stop() {
        store.dispatch(actionStop())
    }

    next() {
        store.dispatch(actionNext());
    }

    on(name, callback) {
        return this.player.on(name, callback)
    }

    configure(key, value) {
        this.options[key] = value;
        return this;
    }

}