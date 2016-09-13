import SC from 'soundcloud';
import {merge} from 'lodash';
import url from 'url';

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
    actionSetApi,
    actionAddTracks,
    actionSetOptions,
    actionSetPlaylist
} from './app/store';

export default class SoundCloudLikePlayer {

    constructor(opts) {
        this.options = this.parseOptions(opts);
        this.api = window.SC = SC;
        this.api._get = this.get.bind(this);

        SC.connect2 = () => SC.connect().then(result => {
            localStorage.setItem('SC_OAUTH_TOKEN', result.oauth_token);
            return result;
        }).catch(err => {
            console.log('connect error', err)
        });

        this.api.initialize({
            client_id: this.options.clientId,
            redirect_uri: this.options.redirectUri,
            oauth_token: localStorage.getItem('SC_OAUTH_TOKEN')
        });
        
        store.dispatch(actionSetOptions(this.options));
        store.dispatch(actionSetApi(this.api));


        this.app = ReactDOM.render(
            <Provider store={store}><App options={this.options}/></Provider>, this.options.container
        );

    }

    get defaults() {
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
                    trackActive: '#ff5500'
                }
            },
            width: 'auto',
            height: null,
            showLikeButton: true,
            showDownloadButton: true,
            showBuyButton: true,
            showFollowButton: true,
            showShareButton: true,
            showPlayCount: true
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
        if (!options.playerClientId) {
            options.playerClientId = options.clientId
        }
        return options;
    }

    resolve(url) {
        return (this.options.apiUrl ? this.get('/resolve', {url:url}) : this.api.resolve(url)).then(data => {
            let tracks = data instanceof Array
                ? data : data.kind == 'playlist'
                ? data.tracks : data.kind == 'track'
                ? [data] : [];
            store.dispatch(actionSetPlaylist(data));
            store.dispatch(actionSetTracks(tracks));
            store.dispatch(actionSetTrack(0, store.getState().options.autoplay));
            return data;
        });
    }

    search(params, clear = true) {
        return this.get('/tracks', params)
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

    configure(key, value) {
        this.options[key] = value;
        return this;
    }

    get(path, params) {
        if (this.options.apiUrl) {
            let fetchUrl = this._appendQueryParams(
                this.options.apiUrl + path, 
                Object.assign(params, {client_id: this.options.playerClientId})
            );
            return fetch(fetchUrl).then(response => response.json())
        } else {
            return this.api.get(path, params)
        }
    }

    _appendQueryParams(_url, params = {}) {
        let parsed = url.parse(_url, true);
        parsed.query = Object.assign(parsed.query, params);
        return url.format(parsed);
    }

    clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }
}