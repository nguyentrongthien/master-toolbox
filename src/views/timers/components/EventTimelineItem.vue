<template>
    <v-timeline-item large
        :color="event.state === 'ongoing' ? 'green' : 'grey'"
    >

        <template v-slot:icon>
            <v-hover v-slot="{ hover }">
                <v-btn v-if="hover" fab color="red" @click="removeTimer(event.id)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn v-else fab :color="event.isStartingSoon ? 'yellow' : event.state === 'ongoing' ? 'green' : 'grey'">
                    <v-icon>{{event.state === 'ongoing' ? 'mdi-bell-ring' : 'mdi-bell-outline'}}</v-icon>
                </v-btn>
            </v-hover>
        </template>

        <template v-slot:opposite>
            <span>{{event.fromNow}}</span>
        </template>
        <v-card :class="event.isStartingSoon ? 'elevation-2 upcomingEvent' : (event.state === 'ongoing' ? 'ongoingEvent' : '')">
            <v-card-title class="text-h5">
                {{event.name}}
            </v-card-title>
            <v-card-subtitle>
                Scheduled for: {{event.scheduled}}
                <br>
                Local time: {{event.local}}
            </v-card-subtitle>
            <v-card-text v-if="event.description" class="grey--text">{{event.description}}</v-card-text>
            <v-card-text v-else class="grey--text"><i>(No description provided)</i></v-card-text>
        </v-card>
    </v-timeline-item>
</template>

<script>
import moment from "moment-timezone";

export default {
    name: "EventTimelineItem",
    props: ['value', 'now'], // 'now' is the moment().unix() value
    methods: {
        removeTimer(eventId) {
            this.$store.dispatch('timers/deleteEvent', eventId);
        },
        convertToReadableDuration(duration) {
            let readable = '';
            let leftover = duration;
            let hour = (leftover - (leftover % 3600)) / 3600;
            leftover = leftover % 3600;
            readable += (hour < 10 ? '0' + hour : hour) + ':';
            let minute = (leftover - (leftover % 60)) / 60;
            readable += (minute < 10 ? '0' + minute : minute) + ':';
            leftover = leftover % 60;
            readable += (leftover < 10 ? '0' + leftover : leftover);
            return readable;
        }
    },
    computed: {
        event() {
            let event = this.$store.getters['timers/getEventById'](this.value);
            let scheduledTime = moment.tz(event.date + ' ' + event.time, event.zone).tz('Australia/Sydney');
            let fromNowInSeconds = scheduledTime.unix() - this.now;
            return {
                ...event,
                scheduled: moment.tz(event.date + ' ' + event.time, event.zone).format("dddd, MMMM Do YYYY, kk:mm:ss [(]z[)]"),
                local: scheduledTime.format("dddd, MMMM Do YYYY, kk:mm:ss [(]zz[)]"),
                fromNow: fromNowInSeconds < 0 ? scheduledTime.fromNow() : this.convertToReadableDuration(fromNowInSeconds),
                isStartingSoon: (moment() < scheduledTime) & (moment() > scheduledTime.subtract(event.alertBefore, 'seconds')),
            }
        }
    }

}
</script>

<style scoped>
    @keyframes flashBorder {
        from {
            border: 1px solid transparent;
        }

        to {
            border: 1px solid gold;
        }
    }

    .upcomingEvent {
        animation-duration: 0.5s;
        animation-name: flashBorder;
        animation-iteration-count: infinite;
        animation-direction: alternate;
    }
    .ongoingEvent {
        border: 1px solid green;
    }
</style>