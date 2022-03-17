<template>
    <v-container class="fill-height">
        <v-row justify="center" align="center">
            <v-col cols="12">
                <v-row justify="center">
                    <v-col cols="auto">

                        <v-card class="ongoingEvent">
                            <v-card-title class="text-h5">
                                Welcome to Master's Toolbox Timer!
                            </v-card-title>
                            <v-card-text class="display-3 text-center white--text pb-0">
                                {{mainClock}}
                            </v-card-text>
                            <v-card-text class="text-center">
                                {{calendarDate}}
                            </v-card-text>
                            <v-card-text class="grey--text darken-4 caption">
                                PST Time: {{test2}}
                            </v-card-text>

                            <v-card-actions>
                                <v-btn
                                    text
                                    color="teal accent-4"
                                >
                                    Settings
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>

                <v-timeline v-if="events.length">

                    <v-timeline-item
                        v-for="(event, index) in events"
                        :key="index"
                        large
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
                </v-timeline>
            </v-col>
        </v-row>

        <NewTimerDialog v-model="newTimerDialog"/>

        <v-speed-dial
            v-model="fab" bottom right fixed
            direction="top" open-on-hover
            transition="scale-transition"
        >
            <template v-slot:activator>
                <v-btn v-model="fab" color="blue darken-2" dark fab>
                    <v-icon v-if="fab">
                        mdi-close
                    </v-icon>
                    <v-icon v-else>
                        mdi-menu
                    </v-icon>
                </v-btn>
            </template>
            <v-btn fab dark small color="green" @click="newTimerDialog = !newTimerDialog">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-speed-dial>
    </v-container>
</template>

<script>
import moment from "moment-timezone";
import NewTimerDialog from "./components/NewTimerDialog";

export default {
    name: "Main",
    components: {NewTimerDialog},
    data: () => ({
        interval: 1000, // in milliseconds
        timer: null, // the timer object
        mainClock: 'XX:XX pm',
        calendarDate: 'Date, 0th of Month, Year',
        test2: '',
        newTimerDialog: false,
        fab: false,
        events: [],
    }),
    mounted() {
        this.timer = setInterval(this.count, this.interval);
    },
    methods: {
        count() {
            this.mainClock = moment().format("hh:mm a");
            this.calendarDate = moment().format("dddd, Do [of] MMMM, YYYY");
            // this.test2 = moment('14 Dec 2022 19:30 PST').isDST();
            // this.test2 = moment.tz('2022-03-12 21:00', 'America/Los_Angeles').tz('Australia/Sydney').format("dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]");
            this.test2 = moment.tz('America/Los_Angeles').format("dddd, MMMM Do YYYY, kk:mm:ss [(]Z[)]");
            this.$store.dispatch('timers/update');


            this.events.splice(0);

            this.$store.getters['timers/ongoingEvents'].forEach(eventId => {
                this.pushNewEvent(this.$store.getters['timers/getEventById'](eventId), eventId, 'ongoing');
            })
            this.$store.getters['timers/upcomingEvents'].forEach(eventId => {
                this.pushNewEvent(this.$store.getters['timers/getEventById'](eventId), eventId, 'upcoming');
            })
        },
        pushNewEvent(event, id, state) {
            let scheduledTime = moment.tz(event.date + ' ' + event.time, event.zone).tz('Australia/Sydney');
            let fromNowInSeconds = scheduledTime.unix() - moment().unix();
            this.events.push({
                id: id,
                scheduled: moment.tz(event.date + ' ' + event.time, event.zone).format("dddd, MMMM Do YYYY, kk:mm:ss [(]z[)]"),
                local: scheduledTime.format("dddd, MMMM Do YYYY, kk:mm:ss [(]zz[)]"),
                fromNow: fromNowInSeconds < 0 ? scheduledTime.fromNow() : this.convertToReadableDuration(fromNowInSeconds),
                state: state,
                isStartingSoon: (moment() < scheduledTime) & (moment() > scheduledTime.subtract(10, 'minutes')),
                ...event
            })
        },
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
    beforeDestroy() {
        clearInterval(this.timer);
    },
    computed: {

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