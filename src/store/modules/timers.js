import moment from 'moment-timezone';
import {createHash} from "crypto";

function getHashFromString(string) {
    return createHash('sha256').update(string).digest('hex');
}

let events = {};

const state = {
    ongoing: [],
    upcoming: [],
    past: [],
    names: [
        'Lost Ark - Island',
        'Lost Ark - Sailing Coop',
        'Lost Ark - World Boss'
    ],
};
const getters = {
    ongoingEvents: state => state.ongoing,
    upcomingEvents: state => state.upcoming,
    pastEvents: state => state.past,
    pastNames: state => state.names,
    getEventById: () => id => events[id],
};
const mutations = {
    sortUpcomingEvents: state => {
        state.upcoming.sort((a, b) => {
                let event1 = events[a];
                let event2 = events[b];
                return moment.tz(event1.date + ' ' + event1.time, event1.zone) <=
                moment.tz(event2.date + ' ' + event2.time, event2.zone) ? -1 : 1
            }
        )
    },
    addUpcomingEvent: (state, payload) => {
        let id = getHashFromString(JSON.stringify(payload))
        events[id] = {
            id: id,
            date: payload.date,
            time: payload.time,
            zone: payload.zone,
            duration: payload.duration,
            name: payload.name,
            description: payload.description,
        }
        state.upcoming.push(id);
    },
    removeUpcomingEvent: (state, eventId) => {
        let eventIndex = state.upcoming.findIndex(id => id === eventId);
        if (eventIndex >= 0) state.upcoming.splice(eventIndex, 1);
    },
    addOngoingEvent: (state, eventId) => {
        state.ongoing.push(eventId);
    },
    removeOngoingEvent: (state, eventId) => {
        let eventIndex = state.ongoing.findIndex(id => id === eventId);
        if (eventIndex >= 0) state.ongoing.splice(eventIndex, 1);
    },
    addPastEvent: (state, eventId) => {
        state.past.push(eventId);
    },
    removePastEvent: (state, eventId) => {
        let eventIndex = state.past.findIndex(id => id === eventId);
        if (eventIndex >= 0) state.past.splice(eventIndex, 1);
    },
    addNewName: (state, name) => {
        if (state.names.findIndex(item => item.name === name) < 0) {
            state.names.push(name);
            state.names.sort();
        }
    }
};
const actions = {
    addNewTimer: (context, payload) => {
        context.commit('addUpcomingEvent', payload);
        context.commit('addNewName', payload.name);
        context.commit('sortUpcomingEvents');
    },
    update: (context) => {

        let length = context.state.ongoing.length;
        for(let i = 0; i < length; i++) {
            let item = events[context.state.ongoing[i]];
            let temp = moment.tz(item.date + ' ' + item.time, item.zone).tz('Australia/Sydney').unix();
            if (moment().unix() >= temp + item.duration) {
                context.commit('addPastEvent', context.state.ongoing[i]);
                context.commit('removeOngoingEvent', context.state.ongoing[i]);
                i--;
                length--;
            }
        }

        length = context.state.upcoming.length;

        for(let i = 0; i < length; i++) {
            let item = events[context.state.upcoming[i]];
            let temp = moment.tz(item.date + ' ' + item.time, item.zone).tz('Australia/Sydney').unix();
            if (moment().unix() >= temp + item.duration) {
                // TODO: maybe permanently delete an event that was moved to 'past' array???
                context.commit('addPastEvent', context.state.upcoming[i]);
                context.commit('removeUpcomingEvent', context.state.upcoming[i]);
                i--;
                length--;
            } else if (moment().unix() >= temp) {
                context.commit('addOngoingEvent', context.state.upcoming[i]);
                context.commit('removeUpcomingEvent', context.state.upcoming[i]);
                i--;
                length--;
            }

        }
    },
    deleteEvent: (context, eventId) => {
        context.commit('removeOngoingEvent', eventId);
        context.commit('removeUpcomingEvent', eventId);
        context.commit('removePastEvent', eventId);
        delete events[eventId];
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};