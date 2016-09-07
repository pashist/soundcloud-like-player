import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import {Promise} from 'es6-promise';

const initialState = {
    isPlaying: false,
    isFetching: false,
    currentTime: 0,
    index: 0,
    tracks: [],
    track: null,
    player: null,
    likes: {},
    playlist: null,
    followings: {
        isFetched: false,
        isFetching: false,
        error: null,
        promise: null,
        data: []
    },
    shareButtonActive: false,
    isEmbedCodeVisible: false,
    isEmbedCodeWordpress: false
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'PLAYBACK_START':
            state.player.play({playlistIndex: action.index});
            return {...state, isPlaying: true, index: action.index, track: state.tracks[action.index]};
        case 'PLAYBACK_PAUSE':
            state.player.pause();
            return {...state, isPlaying: false};
        case 'PLAYBACK_STOP':
            state.player.stop();
            return {...state, isPlaying: false, currentTime: 0};
        case 'SET_TRACK_CURRENT_TIME':
            state.player.audio.currentTime = action.time;
            return {...state, currentTime: action.time};
        case 'UPDATE_CURRENT_TIME':
            return {...state, currentTime: action.time};
        case 'SET_CURRENT_TRACK':
            return {...state, index: action.index, track: state.tracks[action.index]};
        case 'SET_TRACKS':
            return {...state, tracks: action.tracks};
        case 'SET_PLAYLIST':
            return {...state, playlist: action.playlist};
        case 'ADD_TRACKS':
            return {...state, tracks: state.tracks.concat(action.tracks)};
        case 'UPDATE_TRACKS':
            return {
                ...state,
                tracks: state.tracks.map(track => action.tracks.find(_track => _track.id == track.id) || track)
            };
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
        case 'SET_API':
            return {...state, api: action.api};
        case 'SET_OPTIONS':
            return {...state, options: action.options};
        case 'LIKE_TRACK':
            return {...state, likes: {...state.likes, [action.trackId]: {isFetching: false, value: true}}};
        case 'UNLIKE_TRACK':
            return {...state, likes: {...state.likes, [action.trackId]: {isFetching: false, value: false}}};
        case 'LIKE_TRACK_STATUS_REQUEST':
            return {
                ...state,
                likes: {...state.likes, [action.trackId]: {isFetching: true, value: false, promise: action.promise}}
            };
        case 'FOLLOW':
            return {
                ...state,
                followings: {
                    ...state.followings,
                    data: action.value
                        ? state.followings.data.concat(action.id)
                        : state.followings.data.filter(id => id != action.id)
                }
            };
        case 'FETCH_FOLLOWINGS_REQUEST':
            return {
                ...state,
                followings: {...state.followings, isFetching: true, promise: action.promise}
            };
        case 'FETCH_FOLLOWINGS_SUCCESS':
            return {
                ...state,
                followings: {...state.followings, isFetching: false, isFetched: true, data: action.data}
            };
        case 'FETCH_FOLLOWINGS_ERROR':
            console.log('FETCH_FOLLOWINGS_ERROR', action.error);
            return {
                ...state,
                followings: {...state.followings, isFetching: false, error: action.error}
            };
        case 'TOGGLE_SHARE_BUTTON':
            return {...state, shareButtonActive: !state.shareButtonActive};
        case 'TOGGLE_EMBED_CODE':
            return {...state, isEmbedCodeVisible: !state.isEmbedCodeVisible};
        case 'TOGGLE_EMBED_CODE_WP':
            return {...state, isEmbedCodeWordpress: !state.isEmbedCodeWordpress};
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
export function actionSetApi(api) {
    return {type: 'SET_API', api: api}
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
        dispatch(actionSetCurrentTrack(index));

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
export function actionSetCurrentTrack(index) {
    return {type: 'SET_CURRENT_TRACK', index: index}
}
export function actionSetTracks(tracks) {
    return {type: 'SET_TRACKS', tracks: tracks}
}
export function actionSetPlaylist(playlist) {
    return {type: 'SET_PLAYLIST', playlist: playlist.kind == 'playlist' ? playlist : null}
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
export function actionUpdateCurrentTime(time) {
    return {type: 'UPDATE_CURRENT_TIME', time: time}
}

export function actionTrackLikeRequest(trackId) {
    return function (dispatch, getState) {
        let state = getState();
        return state.api.connect2()
            .then(() => state.api.put('/me/favorites/' + trackId))
            .then(() => dispatch(actionLikeTrack(trackId)))
            .catch(err => console.log('like track err:', err));
    };
}
export function actionTrackUnlikeRequest(trackId) {
    return function (dispatch, getState) {
        let state = getState();
        return state.api.connect2()
            .then(() => state.api.delete('/me/favorites/' + trackId))
            .then(() => dispatch(actionUnlikeTrack(trackId)))
            .catch(err => console.log('unlike track err:', err));
    };
}
export function actionTrackLikeStatusRequest(trackId) {
    return function (dispatch, getState) {
        let state = getState();
        let promise;
        if (!state.api.isConnected()) return Promise.resolve();
        if (state.likes[trackId] && state.likes[trackId].isFetching) {
            promise = state.likes[trackId].promise;
        } else {
            promise = state.api.connect2()
                .then(() => state.api.get('/me/favorites/' + trackId))
                .then(() => dispatch(actionLikeTrack(trackId)))
                .catch(err => dispatch(actionUnlikeTrack(trackId)));
            dispatch({type: 'LIKE_TRACK_STATUS_REQUEST', trackId: trackId, promise: promise});
        }
        return promise;
    };
}

export function actionLikeTrack(trackId) {
    return {type: 'LIKE_TRACK', trackId: trackId}
}
export function actionUnlikeTrack(trackId) {
    return {type: 'UNLIKE_TRACK', trackId: trackId}
}

export function actionFollowRequest(id, value = true) {
    return function (dispatch, getState) {
        let state = getState();
        let promise = state.api.connect2();
        value
            ? promise.then(() => state.api.put('/me/followings/' + id))
            : promise.then(() => state.api.delete('/me/followings/' + id));
        promise
            .then(() => dispatch(actionFollow(id, value)))
            .catch(err => console.log('follow err:', err));
    };
}
export function actionFetchFollowings() {
    return function (dispatch, getState) {
        let state = getState();
        let promise;
        if (!state.api.isConnected()) return Promise.resolve();
        if (state.followings.isFetching) {
            promise = state.followings.promise;
        } else {
            promise = state.api.connect2()
                .then(() => state.api.get('/me/followings/ids'))
                .then(data => dispatch(actionFetchFollowingsSuccess(data.collection)))
                .catch(error => dispatch(actionFetchFollowingsError(error)));
            dispatch({type: 'FETCH_FOLLOWINGS_REQUEST', promise: promise});
        }
        return promise;
    };
}
export function actionFetchFollowingsIfNeeded() {
    return function (dispatch, getState) {
        if (getState().followings.isFetched) {
            return Promise.resolve();
        } else {
            dispatch(actionFetchFollowings());
        }
    };
}

export function actionFollow(id, value) {
    return {type: 'FOLLOW', id: id, value: value}
}
export function actionFetchFollowingsSuccess(data) {
    return {type: 'FETCH_FOLLOWINGS_SUCCESS', data: data}
}
export function actionFetchFollowingsError(error) {
    return {type: 'FETCH_FOLLOWINGS_ERROR', data: error}
}

export function actionToggleShareButton() {
    return {type: 'TOGGLE_SHARE_BUTTON'}
}
export function actionToggleEmbedCode() {
    return {type: 'TOGGLE_EMBED_CODE'}
}
export function actionToggleEmbedCodeWordpress() {
    return {type: 'TOGGLE_EMBED_CODE_WP'}
}
function fetchWaveform(index) {
    let track = store.getState().tracks[index];
    let url = track.waveform_url.replace(/\/\/w1/, '//wis').replace(/png$/, 'json');
    return fetch(url).then(res => res.json());
}
