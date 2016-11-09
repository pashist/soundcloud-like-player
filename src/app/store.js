import {combineReducers, createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import fetch from 'isomorphic-fetch';
import {Promise} from 'es6-promise';
import eventEmitter from 'event-emitter';

const initialState = {
    isPlaying: false,
    isPlayed: false, // once playback was started
    isSingle: false, //single track
    isFetching: false,  // track loading
    promise: null,      // track loading
    currentTime: 0,
    index: null,
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
    isSharePanelActive: false,
    isEmbedCodeVisible: false,
    isEmbedCodeWordpress: false,
    tooltipTarget: null,
    audio: document.createElement('audio'),
    scrollValue: {},
    playlistHeight: null,
    mainColor: [255, 255, 255],
    events: eventEmitter({}),
    resetScroll: false,
    trackHeight: 31
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'PLAY':
            if (state.player) {
                state.player.play();
                state.events.emit('play'); //todo bind to player events
                return {...state, isPlaying: true, isPlayed: true};
            } else {
                alert(`Can't play this track`);
                return state;
            }
        case 'PAUSE':
            state.player.pause();
            state.events.emit('pause');
            return {...state, isPlaying: false};
        case 'STOP':
            state.player.pause();
            state.events.emit('pause');
            return {...state, isPlaying: false};
        case 'TOGGLE':
            if(state.isPlaying) {
                state.player.pause();
                state.events.emit('pause');
            } else {
                state.player.play();
                state.events.emit('play');
            }
            return {...state, isPlaying: !state.isPlaying, isPlayed: true};
        case 'SET_TRACK_CURRENT_TIME':
            if (state.player) {
                state.options.nativePlayer
                    ? state.player.currentTime = action.time / 1000
                    : state.player.seek(action.time);
            }
            return {...state, currentTime: action.time};
        case 'UPDATE_CURRENT_TIME':
            return {...state, currentTime: action.time};
        case 'SET_CURRENT_TRACK':
            return {...state, index: action.index, track: state.tracks[action.index]};
        case 'NEXT_TRACK':
            index < store.getState().tracks.length ? setTrack(index) : stop();
            return {...state, index: action.index, track: state.tracks[action.index]};
        case 'SET_TRACKS':
            return {...state, tracks: action.tracks, resetScroll: true};
        case 'RESET_TRACKS':
            if (state.isPlaying) {
                state.player.pause();
                state.events.emit('pause');
            }
            return {
                ...state, 
                tracks: [],
                playlist: null,
                isSingle: false,
                track: null,
                isPlaying: false,
                isPlayed: false,
                index: null,
                playlistHeight: null
            };
        case 'SET_PLAYLIST':
            return {...state, playlist: action.playlist};
        case 'SET_SINGLE':
            return {...state, isSingle: action.isSingle};
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
        case 'TRACK_WAVEFORM_REQUEST':
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
            return {
                ...state, 
                isMini: action.payload.height < 160,
                isNarrow: action.payload.width < 350,
                options: action.payload
            };
        case 'UPDATE_OPTIONS':
            return {
                ...state, 
                isMini: action.payload.height < 160,
                isNarrow: action.payload.width < 350,
                options: {...state.options, ...action.payload}
            };
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

        case 'TOGGLE_SHARE_PANEL':
            return {...state, isSharePanelActive: !state.isSharePanelActive};
        case 'TOGGLE_EMBED_CODE':
            return {...state, isEmbedCodeVisible: !state.isEmbedCodeVisible};
        case 'TOGGLE_EMBED_CODE_WP':
            return {...state, isEmbedCodeWordpress: !state.isEmbedCodeWordpress};
        case 'TOGGLE_TOOLTIP':
            return {...state, tooltipTarget: action.tooltipTarget || null};
        case 'PLAYLIST_SCROLL':
            return {...state, scrollValue: action.value};
        case 'PLAYLIST_HEIGHT':
            return {...state, playlistHeight: action.value};
        case 'MAIN_COLOR':
            return {...state, mainColor: action.value};
        case 'SET_STATE_VALUE':
            return {...state, [action.key]: action.value};
        default:
            return state;
    }
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
let store = createStore(reducer, initialState, composeEnhancers(applyMiddleware(thunk)));

export default store;