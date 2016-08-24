const SoundCloudAudio = require('soundcloud-audio');
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
    actionSetPlayer
} from './app/store';

export default class SoundCloudLikePlayer {
    constructor(opts) {
        this.options = this.parseOptions(opts);
        this.player = new SoundCloudAudio(this.options.clientId);
        this.app = ReactDOM.render(
            <Provider store={store}><App id={this.options.id}/></Provider>, this.options.container
        );
        store.dispatch(actionSetPlayer(this.player));
    }

    parseOptions(data) {
        const defaults = {
            id: 'scp_' + Math.random()
        };
        let options = Object.assign({}, defaults, data instanceof Object ? data : {});
        
        if (!options.container) {
            throw new Error('Parameter `container` required');
        }
        if (!options.container instanceof HTMLElement) {
            throw new Error('Parameter `container` invalid');
        }
        if (!options.clientId) {
            throw new Error('Parameter `clientId` required');
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
                    store.dispatch(actionSetTrack(0));
                    resolve(data);
                })
            } catch (err) {
                reject(err);
            }
        });
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
}


