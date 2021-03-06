import SC from 'soundcloud';
import {merge} from 'lodash';
import url from 'url';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './app/app';
import {Provider} from 'react-redux';
import store from './app/store';
import * as actions from './app/actions';

export default class SoundCloudLikePlayer {

    constructor(opts) {
        this.url = null;
        this.options = this.parseOptions(opts);
        this.api = window.SC = SC;
        this.api._get = this.get.bind(this);

        SC.connect2 = () => SC.connect().then(result => {
            localStorage.setItem('SC_OAUTH_TOKEN', result.oauth_token);
            return result;
        }).catch(err => {
            console.log('connect error', err)
        });

        this.initApi();
        
        store.dispatch(actions.setOptions(this.options));
        store.dispatch(actions.setApi(this.api));


        this.app = ReactDOM.render(
            <Provider store={store}><App options={this.options}/></Provider>, this.options.container
        );

    }

    get defaults() {
        return {
            id: 'scp_' + Math.random(),
            autoplay: false,
            apiUrl: 'https://api.soundcloud.com',
            colors: {
                main: '#ff5500',
                shade: '#ff2200',
                darker: '#cc4400',
                lighter: '#ff884d',
             /*   playButton: {
                    fill: ['#ff5500', '#ff2200'],
                    stroke: '#cc4400'
                },*/
                playlist: {
                    track: '#333',
                    trackActive: '#ff5500'
                }
            },
            width: null,
            height: null,
            minHeight: 166,
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
        if (!options.playerClientId) {
            options.playerClientId = options.clientId
        }
        
        let containerStyle = window.getComputedStyle(options.container);
        if (!options.height) {
            options.height = parseInt(containerStyle.height) || options.container.offsetHeight;
        }
        if (!options.width) {
            options.width = parseInt(containerStyle.width) || options.container.offsetWidth
        }
        
        return options;
    }

    parseStartTime(sourceUrl) {
        let result = 0;
        let hash = url.parse(sourceUrl).hash;
        if (hash) {
            let timeMark = hash ? hash.match(/#t=([0-9:]+)/) : null;
            if (timeMark && timeMark[1]) {
                result = timeMark[1].split(':').reverse().reduce((prev, curr, i) => prev + curr*Math.pow(60,i), 0) * 1000
            }
        }
        return result;
    }

    resolve(sourceUrl) {
        this.url = sourceUrl;
        return this.get('/resolve', {url:sourceUrl}).then(data => {
            this.updateSource(data, {startTime: this.parseStartTime(sourceUrl)});
            return data;
        }).catch(err => {
            console.log(err);
            this.clear();
        });
    }

    search(params, clear = true) {
        return this.get('/tracks', params)
            .then(data => {
                let tracks = data instanceof Array ? data : [];
                if (clear) {
                    store.dispatch(actions.setTracks(tracks));
                    store.dispatch(actions.setTrack(0, this.options.autoplay));
                } else {
                    store.dispatch(actions.addTracks(tracks));
                }
                return data;
            })
    }

    /**
     * clear track list
     */
    clear() {
        store.dispatch(actions.resetTracks());
    }

    /**
     * reload tracks from current url
     */
    reload() {
        this.clear();
        this.resolve(this.url);
    }
    play(args) {
        store.dispatch(actions.play(args))
    }

    pause() {
        store.dispatch(actions.pause())
    }

    stop() {
        store.dispatch(actions.stop())
    }

    next() {
        store.dispatch(actions.next());
    }
    update(opts) {
        store.dispatch(actions.updateOptions(opts));
        this.options = this.parseOptions(_.assign(this.options, opts));
        this.initApi();
    }
    configure(key, value) {
        this.options[key] = value;
        return this;
    }
    on(event, callback) {
        return store.getState().events.on(event, callback); //todo consider move to native audio and use builtin events
    }
    get(path, params) {
        if (this.options.apiUrl) {
            let fetchUrl = this.appendQueryParams(
                this.options.apiUrl + path, 
                Object.assign(params, {client_id: this.options.playerClientId})
            );
            return fetch(fetchUrl).then(response => response.json())
        } else {
            return this.api.get(path, params)
        }
    }

    appendQueryParams(_url, params = {}) {
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

    updateSource(data, params = {}){
        if (!data || data.errors || (data instanceof Array && !data.length)) {
            this.clear();
        } else {
            let tracks = data instanceof Array
                ? data : data.kind == 'playlist'
                ? data.tracks : data.kind == 'track'
                ? [data] : [];
            store.dispatch(actions.resetTracks());
            store.dispatch(actions.setPlaylist(data));
            store.dispatch(actions.setSingle(data.kind == 'track'));
            store.dispatch(actions.setTracks(tracks));
            store.dispatch(actions.setTrack(0, store.getState().options.autoplay, params.startTime));
        }

    }

    initApi(){
        this.api.initialize({
            client_id: this.options.clientId,
            redirect_uri: this.options.redirectUri,
            oauth_token: localStorage.getItem('SC_OAUTH_TOKEN')
        });
    }
}