<template>
    <v-container class="fill-height">
        <v-row justify="center" align="center">
            <v-col cols="12">
                <p>{{test}}</p>
                <p>{{test2}}</p>
                <v-timeline>
                    <v-timeline-item
                        v-for="(event, index) in events"
                        :key="index"
                        large
                        :color="event.state === 'ongoing' ? 'green' : 'grey'"
                    >


                        <template v-slot:icon>
                            <v-btn icon color="red" @click="removeTimer(event.id, event.state)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </template>

                        <template v-slot:opposite>
                            <span>{{event.fromNow}}</span>
                        </template>
                        <v-card class="elevation-2">
                            <v-card-title class="text-h5">
                                {{event.name}}
                            </v-card-title>
                            <v-card-subtitle>
                                Scheduled for: {{event.scheduled}}
                                <br>
                                Local time: {{event.local}}
                            </v-card-subtitle>
                            <v-card-text v-if="event.description">{{event.description}}</v-card-text>
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
        test: '',
        test2: '',
        newTimerDialog: true,
        fab: false,
        events: [],
    }),
    mounted() {
        this.$store.dispatch('initialize');
        this.timer = setInterval(this.count, this.interval);
    },
    methods: {
        count() {
            this.test = moment().format("dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]");
            // this.test2 = moment('14 Dec 2022 19:30 PST').isDST();
            // this.test2 = moment.tz('2022-03-12 21:00', 'America/Los_Angeles').tz('Australia/Sydney').format("dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]");
            this.test2 = moment().unix();
            this.$store.dispatch('timers/update');


            this.events.splice(0);
            this.$store.getters['timers/ongoingEvents'].forEach((event, id) => {
                this.events.push({
                    id: id,
                    scheduled: moment.tz(event.date + ' ' + event.time, event.zone).format("dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]"),
                    local: moment.tz(event.date + ' ' + event.time, event.zone).tz('Australia/Sydney').format("dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]"),
                    fromNow: moment.tz(event.date + ' ' + event.time, event.zone).tz('Australia/Sydney').fromNow(),
                    state: 'ongoing',
                    ...event
                })
            })
            this.$store.getters['timers/upcomingEvents'].forEach((event, id) => {
                this.events.push({
                    id: id,
                    scheduled: moment.tz(event.date + ' ' + event.time, event.zone).format("dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]"),
                    local: moment.tz(event.date + ' ' + event.time, event.zone).tz('Australia/Sydney').format("dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]"),
                    fromNow: moment.tz(event.date + ' ' + event.time, event.zone).tz('Australia/Sydney').fromNow(),
                    state: 'upcoming',
                    ...event
                })
            })
            this.events.push({
                id: null,
                scheduled: 'dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]',
                local: 'dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]',
                fromNow: 'time from now',
                name: 'Dummy event',
                duration: 10,
                description: 'Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sed euismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae.',
                state: 'ongoing',
            })
        },
        removeTimer(id, state) {
            if (state === 'upcoming') this.$store.commit('timers/removeUpcomingEvent', id);
            if (state === 'ongoing') this.$store.commit('timers/removeOngoingEvent', id);
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

</style>