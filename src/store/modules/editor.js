const state = {
    job: {
        filename: null,
        callback: null,
    },
    waitingForIPCMain: false,
    done: false,
};

const getters = {
    isWaitingForIPCMain: state => state.waitingForIPCMain,
    isDone: state => state.done,
};

const mutations = {
    setCurrentImageEditingJob: (state, payload ) => {
        let { filename, callback } = payload;
        state.job.filename = filename ? filename : null;
        state.job.callback = callback ? callback : null;
    },
    setWaitingForIPCMain: (state, waiting = false) => { state.waitingForIPCMain = waiting },
    setDone: (state, done = false) => { state.done = done }
}

const actions = {
    test: (context, payload) => {
        let { filename, base64 } = payload;
        window.ipcRenderer.send('from-renderer', {
            fn: 'writeImage', payload: { filename, base64 }, passThrough: {flag: 'editor/dummy'}
        });
    },
    dummy: () => {

    },
    requestImageForCurrentJob: (context, payload) => {
        if (state.job.callback && state.job.filename) {
            let { extension, base64 } = payload;
            window.ipcRenderer.send('from-renderer', {
                fn: 'writeImage', payload: {
                    filename: context.state.job.filename + '.' + extension, base64 },
                passThrough: {flag: 'editor/receiveImageForCurrentJob', callback: context.state.job.callback}
            });
            context.commit('setWaitingForIPCMain', true);
        }
    },
    receiveImageForCurrentJob: (context, payload) => {
        let imagePath = payload.result;
        let { callback } = payload.passThrough;
        context.dispatch(callback, { filename: context.state.job.filename, filepath: imagePath }, {root: true}).then();
        context.commit('setCurrentImageEditingJob', {});
        context.commit('setWaitingForIPCMain', false);
        context.commit('setDone', true);
    }
}

export default {
    state,
    getters,
    actions,
    mutations
};