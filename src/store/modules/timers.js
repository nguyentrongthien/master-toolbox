import moment from 'moment-timezone';

const state = {
    ongoing: [],
    upcoming: [],
    past: [],
};
const getters = {
    ongoingEvents: state => state.ongoing,
    upcomingEvents: state => state.upcoming,
    pastEvents: state => state.past,
};
const mutations = {
    sortUpcomingEvents: state => {
        state.upcoming.sort((a, b) =>
            moment.tz(a.date + ' ' + a.time, a.zone) <= moment.tz(b.date + ' ' + b.time, b.zone) ? -1 : 1
        )
    },
    addUpcomingEvent: (state, payload) => {
        state.upcoming.push({
            date: payload.date,
            time: payload.time,
            zone: payload.zone,
            duration: payload.duration,
            name: payload.name,
            description: payload.description,
        });
    },
    removeUpcomingEvent: (state, index) => {
        state.upcoming.splice(index, 1);
    },
    addOngoingEvent: (state, payload) => {
        state.ongoing.push({
            date: payload.date,
            time: payload.time,
            zone: payload.zone,
            duration: payload.duration,
            name: payload.name,
            description: payload.description,
        });
    },
    removeOngoingEvent: (state, index) => {
        state.ongoing.splice(index, 1);
    },
    addPastEvent: (state, payload) => {
        state.past.push({
            date: payload.date,
            time: payload.time,
            zone: payload.zone,
            duration: payload.duration,
            name: payload.name,
            description: payload.description,
        });
    },
    removePastEvent: (state, index) => {
        state.past.splice(index, 1);
    },
};
const actions = {
    addNewTimer: (context, payload) => {
        context.commit('addUpcomingEvent', payload);
        context.commit('sortUpcomingEvents');
    },
    update: (context) => {

        let length = context.state.ongoing.length;
        for(let i = 0; i < length; i++) {
            let item = context.state.ongoing[i];
            let temp = moment.tz(item.date + ' ' + item.time, item.zone).tz('Australia/Sydney').unix();
            if (moment().unix() >= temp + item.duration) {
                context.commit('addPastEvent', {...context.state.ongoing[i]});
                context.commit('removeOngoingEvent', i);
                i--;
                length--;
            }
        }

        length = context.state.upcoming.length;

        for(let i = 0; i < length; i++) {
            let item = context.state.upcoming[i];
            let temp = moment.tz(item.date + ' ' + item.time, item.zone).tz('Australia/Sydney').unix();
            if (moment().unix() >= temp + item.duration) {
                context.commit('addPastEvent', {...context.state.upcoming[i]});
                context.commit('removeUpcomingEvent', i);
                i--;
                length--;
            } else if (moment().unix() >= temp) {
                context.commit('addOngoingEvent', {...context.state.upcoming[i]});
                context.commit('removeUpcomingEvent', i);
                i--;
                length--;
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