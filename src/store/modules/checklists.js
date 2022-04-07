import moment from 'moment-timezone';
import {createHash} from "crypto";

function getHashFromString(string) {
    return createHash('sha256').update(string).digest('hex');
}

let checklists = {};

const state = {
    active: [],
};////

const getters = {
    getCheckListById: () => id => checklists[id],
    getActiveCheckLists: state => state.active,
    getIndexesOfCheckedItemsInListById: () => id => checklists[id].items.reduce((acc, item, index) => {
        if (item.checked) acc.push(index);
        return acc;
    }, []),
    _getModuleData: state => ({
        active: state.active,
        checklists: checklists,
    }),
};

const mutations = {
    createOrUpdateCheckList: (state, payload) => {
        let id = payload.id ? payload.id : getHashFromString(JSON.stringify(payload));
        checklists[id] = {
            id: id,
            title: payload.title,
            img: 'https://cdn.pixabay.com/photo/2020/07/12/07/47/bee-5396362_1280.jpg',
            description: payload.description,
            repeatable: payload.repeatable,
            resetAtTime: payload.resetAtTime,
            resetAtDate: payload.resetAtDate,
            resetInterval: payload.resetInterval,
            resetIntervalUnit: payload.resetIntervalUnit,
            timeZone: payload.timeZone,
            items: payload.items ? payload.items : []
        }
        if (!state.active.includes(id)) state.active.push(id);
    },
    addNewItemToList: (state, payload) => {
        if (checklists[payload.id]) {
            checklists[payload.id].items.push({
                title: payload.title,
                description: payload.description,
                checked: false,
            })
        }
    },
    deleteItemFromList: (state, payload) => {
        if (checklists[payload.id]) {
            checklists[payload.id].items.splice(payload.itemIndex, 1)
        }
    },
    deleteList: (state, listId) => {
        let listIndex = state.active.findIndex(id => id === listId);
        if (listIndex >= 0) {
            state.active.splice(listIndex, 1);
            delete checklists[listId];
        }
    },
    setCheckedItems: (state, payload) => {
        checklists[payload.listId].items.forEach((item, index) => {
            item.checked = !!payload.indexes.includes(index);
        })
    },
    sortCheckLists: state => {
        state.active.sort((a, b) => {
                let list1 = checklists[a].items.reduce((acc, item) => {
                    if (!item.checked) acc++;
                    return acc;
                }, 0);
                let list2 = checklists[b].items.reduce((acc, item) => {
                    if (!item.checked) acc++;
                    return acc;
                }, 0);
                if (list1 <= 0 && list2 > 0)
                    return 1;
                else if (list1 > 0 && list2 <= 0)
                    return -1;
                else return 0;
            }
        )
    },
    _loadActiveListFromSettings: (state, active) => {
        state.active.splice(0);
        state.active = active;
    },
}

const actions = {
    update: context => {

        let length = context.state.active.length;
        let now = context.rootGetters['nowInUnix'];

        for(let i = 0; i < length; i++) {
            let item = checklists[context.state.active[i]];
            let scheduled = moment.tz(item.resetAtDate + ' ' + item.resetAtTime, item.timeZone).tz('Australia/Sydney');
            let scheduledInUnix = scheduled.unix();
            if (now - scheduledInUnix >= 0) {
                //TODO: reset all items under the list
                let resetInterval = item.resetInterval * item.resetIntervalUnit;
                scheduled = scheduled.add(Math.ceil((now - scheduledInUnix) / resetInterval) * resetInterval, 'seconds');
                checklists[context.state.active[i]].resetAtTime = scheduled.format('HH:mm:ss');
                checklists[context.state.active[i]].resetAtDate = scheduled.format('YYYY-MM-DD');
                checklists[context.state.active[i]].timeZone = 'Australia/Sydney';
                checklists[context.state.active[i]].items.forEach(item => {
                    item.checked = false;
                })
            }
        }
    },
    cloneChecklist: (context, sourceId) => {
        let newList = JSON.parse(JSON.stringify(checklists[sourceId]));
        newList['salt'] = context.rootGetters['nowInUnix'];
        newList['id'] = null;
        context.commit('createOrUpdateCheckList', newList);
    },
    requestImageForList: (context, listId) => {
        context.commit('editor/setCurrentImageEditingJob', {
            filename: listId,
            callback: 'checklists/receiveImageForList'
        }, {root: true});
    },
    receiveImageForList: (context, payload) => {
        let { filename, filepath } = payload;
        if (checklists[filename]) {
            checklists[filename].img = filepath + '?' + moment().unix();
        }
    },
    updateCheckedItems: (context, payload) => {
        context.commit('setCheckedItems', payload);
        context.commit('sortCheckLists');
    },
    _setModuleData: (context, data) => {
        if (data.checklists) {
            checklists = data.checklists;
        }
        if (data.active) {
            context.commit('_loadActiveListFromSettings', data.active);
            context.commit('sortCheckLists');
        }
    },
}

export default {
    state,
    getters,
    actions,
    mutations
};