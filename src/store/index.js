import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';
import {join} from 'path';

const fileName = '.mt_data';

/**
 * Check registred module
 * @param {Array} aPath - path to module - ex: ['my', 'nested', 'module']
 * @return {Boolean}
 */
Vuex.Store.prototype.hasModule = function (aPath) {
    let m = this._modules.root;
    return aPath.every((p) => {
        m = m._children[p];
        return m
    })
};

Vue.use(Vuex);

const defaults = [
    {
        key: 'version',
        value: "0.0.1"
    },
    {
        key: 'directory',
        value: null
    },
    {
        key: 'cache',
        value: null
    },
    {
        key: 'extension',
        value: null
    },
];

const state = {
    busy: false,
    drawer: true,
    reader: false,
    version: "0.0.1",
    placeholder_img: require('./../plugins/base64_img').default,
    data: {},
    appPath: null,
    promptForDirectory: false,
    moduleNames: [],
    now: 0,
};
const mutations = {
    setData : (state, payload) => {
        state.data = payload;
    },
    setBusy : (state, isBusy = true) => {
        state.busy = isBusy;
    },
    setDataProp : (state, args) => {
        Vue.set(state.data, args.key, args.value);
    },
    setDrawer : (state, drawer) => {
        state.drawer = drawer;
    },
    setAppPath : (state, path) => {
        state.appPath = path;
    },
    setReader : (state, reader = true) => {
        state.reader = reader;
    },
    setPromptForDirectory : (state, bool = true) => {
        state.promptForDirectory = bool;
    },
    setNowInUnix : (state, now) => {
        state.now = now;
    }
};
const getters = {
    isBusy : state => state.busy,
    isReading : state => state.reader,
    getDirectory : state => state.data.directory,
    getCache : state => state.data.cache,
    placeholderImg : state => state.placeholder_img,
    drawer : state => state.drawer,
    appPath : state => state.appPath,
    promptForDirectory : state => state.promptForDirectory,
    nowInUnix: state => state.now,
};
const actions = {
    initialize : (context, moduleNames) => {
        for(let name in moduleNames) {
            if(Object.hasOwnProperty.call(moduleNames, name))
                context.state.moduleNames.push(name);
        }
        window.ipcRenderer.send('from-renderer', {
            fn: 'getAppPath', payload: null, passThrough: {flag: 'initializeAppPath'}
        });
    },
    initializeAppPath : (context, payload) => {
        context.commit('setAppPath', payload.result);
        context.dispatch('readInitialData').then();
    },
    readInitialData : (context, payload) => {
        if(!payload) {
            window.ipcRenderer.send('from-renderer', {
                fn: 'readData', payload: context.getters['appPath'] + '/' + fileName, passThrough: {flag: 'readInitialData'}
            });
        } else {
            let res = payload.result.appData;
            if(typeof res === "undefined" || res === null) res = {};
            defaults.forEach(prop => {
                context.commit('setDataProp', {
                    key: prop.key,
                    value: res.hasOwnProperty.call(res, prop.key) ? res[prop.key] : prop.value
                });
            });
            payload.result.moduleSettings.forEach(data => {
                if(context.state.moduleNames.includes(data.name)) {
                    try {
                        context.dispatch(`${data.name}/_setModuleData`, data.settings).then();
                    } catch (e) { console.log(e); }
                }
            })
        }
    },
    writeData : (context) => {
        if(context.state.data.version) { // Check if data has already been initialized (might have concurrency issue)
            let moduleSettings = [];
            for (let name of context.state.moduleNames) {
                let settings = context.rootGetters[`${name}/_getModuleData`];
                if (settings) moduleSettings.push({ name: name, settings })
            }
            writeToDisc({
                path: context.getters['appPath'] + '/',
                file: fileName,
                data: {
                    appData: context.state.data,
                    moduleSettings,
                }
            });
        }
    },
    selectDirectory : (context, payload) => {
        _selectDir(context, payload, 'directory', {flag: 'selectDirectory'}, () => {
            if(!context.getters['getCache'])
                context.commit('setDataProp', { key: 'cache', value: join(payload.result.filePaths[0], 'cache') });
            context.dispatch('series/init').then();
        });
    },
    selectCache : (context, payload) => {
        _selectDir(context, payload, 'cache', {flag: 'selectCache'});
    },
    selectExtension : (context, payload) => {
        _selectDir(context, payload, 'extension', {flag: 'selectExtension'}, () => {
            context.dispatch('extensions/init').then();
        });
    },
};

function _selectDir(context, payload, key, passThrough, successFn) {
    if(!payload)
        window.ipcRenderer.send('from-renderer', { fn: 'getDir', passThrough: passThrough });
    else if (payload.result) {
        if(!payload.result.canceled) {
            context.commit('setDataProp', {key: key, value: payload.result.filePaths[0]});
            if (successFn) successFn();
        }
    }
}

function writeToDisc(data) {
    window.ipcRenderer.send('from-renderer', {
        fn: 'writeData',
        payload: data
    });
}

const store = new Vuex.Store({
    state,
    mutations,
    actions,
    getters,
    modules,
});

export default store;
