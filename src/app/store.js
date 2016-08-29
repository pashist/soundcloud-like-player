import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import {Promise} from 'es6-promise';

const initialState = {
    isPlaying: false,
    currentTime: 0,
    index: 0,
    tracks: [],
    player: null
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'PLAYBACK_START':
            store.getState().player.play({playlistIndex: action.index});
            return {...state, isPlaying: true, index: action.index};
        case 'PLAYBACK_PAUSE':
            store.getState().player.pause();
            return {...state, isPlaying: false};
        case 'PLAYBACK_STOP':
            store.getState().player.stop();
            return {...state, isPlaying: false, currentTime: 0};
        case 'SET_TRACK_CURRENT_TIME':
            store.getState().player.audio.currentTime = action.time;
            return {...state, currentTime: action.time};
        case 'SET_CURRENT_TRACK':
            return {...state, index: action.index};
        case 'SET_TRACKS':
            return {...state, tracks: action.tracks};
        case 'ADD_TRACKS':
            return {...state, tracks: state.tracks.concat(action.tracks)};
        case 'SET_TRACK_WAVEFORM':
            return {
                ...state,
                tracks: state.tracks.map((track, i) => action.index == i ? {...track, waveform: action.data} : track)
            };
        case 'FETCH_TRACK_WAVEFORM':
            return {
                ...state,
                tracks: state.tracks.map((track, i) =>
                    action.index == i ? {...track, waveformPromise: action.promise} : track
                )
            };
        case 'SET_PLAYER':
            return {...state, player: action.player};
        case 'SET_OPTIONS':
            return {...state, options: action.options};
        default:
            return state;
    }
};

let store = createStore(reducer, initialState, applyMiddleware(thunk));

export default store;

export function actionPlay(args = {}) {
    return {type: 'PLAYBACK_START', index: isFinite(args.index) ? args.index : store.getState().index};
}
export function actionPause() {
    return {type: 'PLAYBACK_PAUSE'}
}
export function actionToggle() {
    return store.getState().isPlaying ? actionPause() : actionPlay();
}
export function actionNext() {
    let index = store.getState().index + 1;
    return index < store.getState().tracks.length ? actionSetTrack(index) : actionStop();
}
export function actionStop() {
    return {type: 'PLAYBACK_STOP'}
}
export function actionSetPlayer(player) {
    return {type: 'SET_PLAYER', player: player}
}
export function actionSetOptions(options) {
    return {type: 'SET_OPTIONS', options: options}
}
/**
 * Set current track and fetch waveform data for track if it not fetched yet
 * @param index Track index
 * @param play Start playback after track ready 
 * @returns {*}
 */
export function actionSetTrack(index, play = true) {

    return function (dispatch, getState) {
        let track = getState().tracks[index];
        let promise;
        if (!track) {
            return Promise.reject();
        }

        // no actions if same track selected or it have waveform loaded/pending
        if (index == getState().index && track.waveform) {
            return Promise.resolve();
        }
        // return promise if track selected pending waveform data
        if (track.waveformPromise) {
            promise = track.waveformPromise
        } else {
            promise = fetchWaveform(index)
                .then(data => dispatch(actionSetTrackWaveform(index, data)))
                .catch(err => {
                    console.log('fetchWaveform error', err);
                    return dispatch(actionSetTrackWaveform(index, null))
                })
        }
        dispatch(actionFetchTrackWaveform(index, promise));
        
        if (play) {
            promise.then(() => dispatch(actionPlay({index: index})));
        }
        return promise;
    };
}
export function actionSetTracks(tracks) {
    return {type: 'SET_TRACKS', tracks: tracks}
}
export function actionAddTracks(tracks) {
    return {type: 'ADD_TRACKS', tracks: tracks}
}
export function actionSetTrackWaveform(index, data) {
    return {type: 'SET_TRACK_WAVEFORM', index: index, data: data}
}

export function actionFetchTrackWaveform(index, promise) {
    return {type: 'FETCH_TRACK_WAVEFORM', promise: promise, index: index}
}

export function actionSetTrackCurrentTime(time) {
    return {type: 'SET_TRACK_CURRENT_TIME', time: time}
}

function fetchWaveform(index) {
    let track = store.getState().tracks[index];
    let url = track.waveform_url.replace(/\/\/w1/, '//wis').replace(/png$/, 'json');
    return fetch(url).then(res => res.json());
}
