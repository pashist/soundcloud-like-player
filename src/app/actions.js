import fetch from 'isomorphic-fetch';
import {Promise} from 'es6-promise';
import {eq} from 'lodash';
import { createAction, createActions } from 'redux-actions';

export function createPlayer(startPlayback = false) {
    return function (dispatch, getState) {
        let state = getState();
        if (state.options.nativePlayer) {
            return new Promise((resolve, reject) => {
                try {
                    state.audio.src = `https://api.soundcloud.com/tracks/${state.track.id}/stream?client_id=${state.options.playerClientId}`;
                    state.audio.onended = () => {
                        dispatch(stop());
                        dispatch(next());
                    };
                    dispatch(setPlayer(state.audio));
                    startPlayback && dispatch(play());
                    resolve(true);
                } catch (err) {
                    dispatch(setPlayer(null));
                    reject(err);
                }
            })
        } else {
            return state.api.stream('/tracks/' + state.track.id + `?client_id=${state.options.playerClientId}`).then(player => {
                if (player.options.protocols[0] === 'rtmp') {
                    player.options.protocols.splice(0, 1);
                }
                player.on('finish', () => {
                    dispatch(stop())
                    dispatch(next())
                });
                dispatch(setPlayer(player));
                if (startPlayback) {
                    dispatch(play());
                }
            }).catch(err => {
                dispatch(setPlayer(null));
            });
        }

    }
}

export const { play, pause, stop, toggle, setOptions, updateOptions} = createActions(
    'PLAY',
    'PAUSE',
    'STOP',
    'TOGGLE',
    'SET_OPTIONS',
    'UPDATE_OPTIONS'
);

export function next() {
    return function(dispatch, getState) {
        dispatch(setTrack(getState().index + 1));
    }
}
export function setPlayer(player) {
    return {type: 'SET_PLAYER', player: player}
}
export function setApi(api, playerApi) {
    return {type: 'SET_API', api: api, playerApi: playerApi}
}
/**
 * Set current track and fetch waveform data for track if it not fetched yet
 * @param index Track index
 * @param play Start playback after track ready
 * @returns {*}
 */
export function setTrack(index, play = true) {

    return function (dispatch, getState) {
        let state = getState();
        let track = state.tracks[index];

        if (track && !eq(track, state.track)) {
            dispatch(setCurrentTrack(index));
            dispatch(createPlayer(play));
            dispatch(trackLikeStatusRequest(track.id));
            dispatch(trackWaveformRequest(index));
        }
    };
}
export function setCurrentTrack(index) {
    return {type: 'SET_CURRENT_TRACK', index: index}
}
export function setTracks(tracks) {
    return {type: 'SET_TRACKS', tracks: tracks}
}
export function resetTracks() {
    return {type: 'RESET_TRACKS'}
}
export function setPlaylist(playlist) {
    return {type: 'SET_PLAYLIST', playlist: playlist.kind == 'playlist' ? playlist : null}
}
export function setSingle(value) {
    return {type: 'SET_SINGLE', isSingle: value}
}
export function addTracks(tracks) {
    return {type: 'ADD_TRACKS', tracks: tracks}
}
export function setTrackWaveform(index, data) {
    return {type: 'SET_TRACK_WAVEFORM', index: index, data: data}
}
export function setTrackCurrentTime(time) {
    return {type: 'SET_TRACK_CURRENT_TIME', time: time}
}
export function updateCurrentTime(time) {
    return {type: 'UPDATE_CURRENT_TIME', time: time}
}

export function trackLikeRequest(trackId) {
    return function (dispatch, getState) {
        let state = getState();
        return state.api.connect2()
            .then(() => state.api.put('/me/favorites/' + trackId))
            .then(() => dispatch(likeTrack(trackId)))
            .catch(err => console.log('like track err:', err));
    };
}
export function trackUnlikeRequest(trackId) {
    return function (dispatch, getState) {
        let state = getState();
        return state.api.connect2()
            .then(() => state.api.delete('/me/favorites/' + trackId))
            .then(() => dispatch(unlikeTrack(trackId)))
            .catch(err => console.log('unlike track err:', err));
    };
}
export function trackLikeStatusRequest(trackId) {
    return function (dispatch, getState) {
        let state = getState();
        let promise;
        if (!state.api.isConnected()) return Promise.resolve();
        if (state.likes[trackId] && state.likes[trackId].isFetching) {
            promise = state.likes[trackId].promise;
        } else {
            promise = state.api.connect2()
                .then(() => state.api.get('/me/favorites/' + trackId))
                .then(() => dispatch(likeTrack(trackId)))
                .catch(err => dispatch(unlikeTrack(trackId)));
            dispatch({type: 'LIKE_TRACK_STATUS_REQUEST', trackId: trackId, promise: promise});
        }
        return promise;
    };
}

export function trackWaveformRequest(index) {
    return function (dispatch, getState) {
        let state = getState();
        let promise;
        let track = state.tracks[index];

        if (!track || !track.waveform_url) return Promise.reject();
        if (track.waveform) Promise.resolve();
        if (track.waveformPromise) {
            promise = track.waveformPromise;
        } else {
            let url = track.waveform_url.replace(/\/\/w1/, '//wis').replace(/png$/, 'json');
            promise = fetch(url)
                .then(res => res.json())
                .then(data => dispatch(setTrackWaveform(index, data)))
                .catch(err => {
                    console.log('fetchWaveform error', err);
                });
            dispatch({type: 'TRACK_WAVEFORM_REQUEST', index: index, promise: promise});
        }
        return promise;
    };
}
export function likeTrack(trackId) {
    return {type: 'LIKE_TRACK', trackId: trackId}
}
export function unlikeTrack(trackId) {
    return {type: 'UNLIKE_TRACK', trackId: trackId}
}

export function followRequest(id, value = true) {
    return function (dispatch, getState) {
        let state = getState();
        let promise = state.api.connect2();
        value
            ? promise.then(() => state.api.put('/me/followings/' + id))
            : promise.then(() => state.api.delete('/me/followings/' + id));
        promise
            .then(() => dispatch(follow(id, value)))
            .catch(err => console.log('follow err:', err));
    };
}
export function fetchFollowings() {
    return function (dispatch, getState) {
        let state = getState();
        let promise;
        if (!state.api.isConnected()) return Promise.resolve();
        if (state.followings.isFetching) {
            promise = state.followings.promise;
        } else {
            promise = state.api.connect2()
                .then(() => state.api.get('/me/followings/ids'))
                .then(data => dispatch(fetchFollowingsSuccess(data.collection)))
                .catch(error => dispatch(fetchFollowingsError(error)));
            dispatch({type: 'FETCH_FOLLOWINGS_REQUEST', promise: promise});
        }
        return promise;
    };
}
export function fetchFollowingsIfNeeded() {
    return function (dispatch, getState) {
        if (getState().followings.isFetched) {
            return Promise.resolve();
        } else {
            dispatch(fetchFollowings());
        }
    };
}

export function follow(id, value) {
    return {type: 'FOLLOW', id: id, value: value}
}
export function fetchFollowingsSuccess(data) {
    return {type: 'FETCH_FOLLOWINGS_SUCCESS', data: data}
}
export function fetchFollowingsError(error) {
    return {type: 'FETCH_FOLLOWINGS_ERROR', data: error}
}

export function toggleSharePanel() {
    return {type: 'TOGGLE_SHARE_PANEL'}
}
export function toggleEmbedCode() {
    return {type: 'TOGGLE_EMBED_CODE'}
}
export function toggleEmbedCodeWordpress() {
    return {type: 'TOGGLE_EMBED_CODE_WP'}
}
export function toggleTooltip(target) {
    return {type: 'TOGGLE_TOOLTIP', target: target || null}
}

export function fetchTracksData(ids = []) {
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
                    dispatch(fetchTracksDataSuccess(data, ids))
                })
                .catch(error => dispatch(fetchTracksDataError(error)));
            dispatch({type: 'FETCH_TRACKS_DATA_REQUEST', promise: promise});
        }
        return promise;
    };
}

export function fetchTracksDataSuccess(data, ids) {
    return {type: 'FETCH_TRACKS_DATA_SUCCESS', data: data, ids: ids}
}

export function fetchTracksDataError(error) {
    return {type: 'FETCH_TRACKS_DATA_ERROR', error: error}
}
export function playlistScroll(value) {
    return {type: 'PLAYLIST_SCROLL', value: value}
}
export function setPlaylistHeight(value) {
    return {type: 'PLAYLIST_HEIGHT', value: value}
}
export function setMainColor(value) {
    return {type: 'MAIN_COLOR', value: value}
}
export function setStateValue(key, value) {
    return {type: 'SET_STATE_VALUE', key: key, value: value}
}
function fetchWaveform(track) {
    let url = track.waveform_url.replace(/\/\/w1/, '//wis').replace(/png$/, 'json');
    return fetch(url).then(res => res.json());
}
