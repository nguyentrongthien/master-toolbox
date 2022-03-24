import moment from 'moment-timezone';
import {createHash} from "crypto";

function getHashFromString(string) {
    return createHash('sha256').update(string).digest('hex');
}

let events = {};

const state = {
    upcoming: [],
    past: [],
    names: [],
    alerts: [],
};
const getters = {
    upcomingEvents: state => state.upcoming,
    pastEvents: state => state.past,
    pastNames: state => state.names,
    eventsToAlert: state => state.alerts,
    getEventById: () => id => events[id],
    getModuleData: state => ({
        names: state.names,
        events: events,
    }),
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
            shouldAlert: payload.shouldAlert,
            alertBefore: payload.alertBefore,
            alertSound: payload.alertBefore,
            state: 'upcoming',
        }
        state.upcoming.push(id);
    },
    removeUpcomingEvent: (state, eventId) => {
        let eventIndex = state.upcoming.findIndex(id => id === eventId);
        if (eventIndex >= 0) state.upcoming.splice(eventIndex, 1);
    },
    addPastEvent: (state, eventId) => {
        state.past.push(eventId);
    },
    removePastEvent: (state, eventId) => {
        let eventIndex = state.past.findIndex(id => id === eventId);
        if (eventIndex >= 0) state.past.splice(eventIndex, 1);
    },
    addNewName: (state, name) => {
        if (state.names.findIndex(item => item === name) < 0) {
            state.names.push(name);
            state.names.sort();
        }
    },
    loadNamesFromSettings: (state, names) => {
        state.names.splice(0);
        state.names = names;
    },
    addEventToAlert: (state, eventId) => {
        state.alerts.push(eventId);
    },
    clearEventsToAlert: state => { state.alerts.splice(0); }
};
const actions = {
    addNewTimer: (context, payload) => {
        context.commit('addUpcomingEvent', payload);
        context.commit('addNewName', payload.name);
        context.commit('sortUpcomingEvents');
    },
    update: (context) => {
        let length = context.state.upcoming.length;
        let now = moment().unix();

        for(let i = 0; i < length; i++) {
            let item = events[context.state.upcoming[i]];
            let temp = moment.tz(item.date + ' ' + item.time, item.zone).tz('Australia/Sydney').unix();
            if (now >= temp + item.duration) {
                // TODO: maybe permanently delete an event that was moved to 'past' array???
                context.commit('addPastEvent', context.state.upcoming[i]);
                context.commit('removeUpcomingEvent', context.state.upcoming[i]);
                i--;
                length--;
            } else if (now >= temp) {
                events[context.state.upcoming[i]].state = 'ongoing';
            }
            if (item.shouldAlert && now === temp - item.alertBefore) {
                context.commit('addEventToAlert', context.state.upcoming[i]);
            }

        }
    },
    deleteEvent: (context, eventId) => {
        context.commit('removeUpcomingEvent', eventId);
        context.commit('removePastEvent', eventId);
        delete events[eventId];
    },
    setModuleData: (context, data) => {
        if (data.names) context.commit('loadNamesFromSettings', data.names);
        if (data.events) {
            events = data.events;
            for (const eventId in events) {
                if (Object.hasOwnProperty.call(events, eventId)) {
                    state.upcoming.push(eventId);
                    context.commit('sortUpcomingEvents');
                }
            }
        }
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};