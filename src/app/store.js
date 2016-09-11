import {combineReducers, createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import {Promise} from 'es6-promise';

const initialState = {
    isPlaying: false,
    isFetching: false,  // track loading
    promise: null,      // track loading
    currentTime: 0,
    index: 0,
    error: null,
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
    isEmbedCodeWordpress: false,
    tooltipTarget: null
};

const reducer = (state, action) => {
    //console.log(action);
    switch (action.type) {
        case 'PLAYBACK_START':
            state.player.play();
           // state.player.play({playlistIndex: action.index});
            return {...state, isPlaying: true/*, index: action.index, track: state.tracks[action.index]*/};
        case 'PLAYBACK_PAUSE':
            state.player.pause();
            return {...state, isPlaying: false};
        case 'PLAYBACK_STOP':
            state.player.stop();
            return {...state, isPlaying: false, currentTime: 0};
        case 'SET_TRACK_CURRENT_TIME':
            state.player.seek(action.time);
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
                tracks: state.tracks.map((track, i) => action.index == i ? {...track, waveform: action.data} : track),
                track: {...state.track, waveform: action.data}
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

        case 'FETCH_TRACKS_DATA_REQUEST':
            return {...state, isFetching: true, promise: action.promise};
        case 'FETCH_TRACKS_DATA_SUCCESS':
            return {
                ...state,
                tracks: state.tracks
                    .map(track => action.data.find(_track => _track.id == track.id) || track)
                    .filter(track => action.ids.indexOf(track.id) === -1 || track.user),
                track: state.tracks[state.index],
                isFetching: false
            };
        case 'FETCH_TRACKS_DATA_ERROR':
            console.log('FETCH_TRACKS_ERROR', action.error);
            return {...state, isFetching: false, error: action.error};

        case 'TOGGLE_SHARE_BUTTON':
            return {...state, shareButtonActive: !state.shareButtonActive};
        case 'TOGGLE_EMBED_CODE':
            return {...state, isEmbedCodeVisible: !state.isEmbedCodeVisible};
        case 'TOGGLE_EMBED_CODE_WP':
            return {...state, isEmbedCodeWordpress: !state.isEmbedCodeWordpress};
        case 'TOGGLE_TOOLTIP':
            return {...state, tooltipTarget: action.tooltipTarget || null};
        default:
            return state;
    }
};

let store = createStore(reducer, initialState, applyMiddleware(thunk));

export default store;

export function actionCreatePlayer(startPlayback = false) {
    return function (dispatch, getState) {
        return getState().api.stream('/tracks/' + getState().track.id).then(player => {
            if (player.options.protocols[0] === 'rtmp') {
                player.options.protocols.splice(0, 1);
            }
            player.on('finish', () => dispatch(actionNext()));
            dispatch(actionSetPlayer(player));
            if (startPlayback) {
                dispatch(actionPlay());
            }
        })
    }
}

export function actionPlay() {
    return {type: 'PLAYBACK_START'};
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
        let state = getState();
        let track = state.tracks[index];
        let promise;
        if (!track) {
            return Promise.reject();
        }
        
        dispatch(actionSetCurrentTrack(index));
        dispatch(actionCreatePlayer(play));
        
        // no actions if same track selected or it have waveform loaded/pending
        if (track.waveform) {
            return Promise.resolve();
        }
        // return promise if track selected pending waveform data
        if (track.waveformPromise) {
            promise = track.waveformPromise
        } else {
            promise = fetchWaveform(track)
                .then(data => dispatch(actionSetTrackWaveform(index, data)))
                .catch(err => {
                    console.log('fetchWaveform error', err);
                    return dispatch(actionSetTrackWaveform(index, null))
                })
        }
        dispatch(actionFetchTrackWaveform(index, promise));
        
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
export function actionToggleTooltip(target) {
    return {type: 'TOGGLE_TOOLTIP', target: target || null}
}

export function actionFetchTracksData(ids = []) {
    return function (dispatch, getState) {
        let state = getState();
        let promise;
        if (!ids.length) return Promise.resolve();
        if (state.isFetching) {
            promise = state.promise;
        } else {
            let params = {
                ids: ids.join(','),
                format: 'json',
                app_version: 1470821529
            };
            if (state.playlist) {
                params.playlistId = state.playlist.id;
                params.playlistSecretToken = ''
            }
            promise = state.api._get('/tracks', params)
                .then(data => {
                    //state.player.mergeTracks(ids.map(id => data.find(track => track.id == id)).filter(track => track));
                    dispatch(actionFetchTracksDataSuccess(data, ids))
                })
                .catch(error => dispatch(actionFetchTracksDataError(error)));
            dispatch({type: 'FETCH_TRACKS_DATA_REQUEST', promise: promise});
        }
        return promise;
    };
}

export function actionFetchTracksDataSuccess(data, ids) {
    return {type: 'FETCH_TRACKS_DATA_SUCCESS', data: data, ids: ids}
}

export function actionFetchTracksDataError(error) {
    return {type: 'FETCH_TRACKS_DATA_ERROR', error: error}
}

function fetchWaveform(track) {
    let url = track.waveform_url.replace(/\/\/w1/, '//wis').replace(/png$/, 'json');
    return fetch(url).then(res => res.json());
}
