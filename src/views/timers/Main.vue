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

                <v-row justify="center" class="mt-0">
                    <v-col xl="7" lg="10" cols="12" class="pa-0">
                        <v-timeline>
                            <v-slide-x-transition group>

                                <EventTimelineItem v-for="id in eventIds" :key="id" :value="id" :now="now" />

                            </v-slide-x-transition>
                        </v-timeline>
                    </v-col>
                </v-row>

                <v-row justify="center" class="mt-0">
                    <v-col cols="auto">
                        <v-card>
                            <v-card-text class="text-center">
                                End of timeline
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <NewTimerDialog v-model="newTimerDialog"/>

        <AlertDialog />

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
import AlertDialog from "./components/AlertDialog";
import EventTimelineItem from "./components/EventTimelineItem";
import { mapGetters } from "vuex";

export default {
    name: "Main",
    components: {EventTimelineItem, AlertDialog, NewTimerDialog},
    data: () => ({
        interval: 1000, // in milliseconds
        timer: null, // the timer object
        mainClock: 'XX:XX pm',
        calendarDate: 'Date, 0th of Month, Year',
        test2: '',
        newTimerDialog: false,
        fab: false,
        events: [],
        now: 0,
    }),
    computed: {
        ...mapGetters(['nowInUnix']),
        eventIds() {
            return this.$store.getters['timers/upcomingEvents'];
        },
    },
    watch: {
        nowInUnix(val) {
            this.mainClock = moment().format("hh:mm a");
            this.calendarDate = moment().format("dddd, Do [of] MMMM, YYYY");
            // this.test2 = moment('14 Dec 2022 19:30 PST').isDST();
            // this.test2 = moment.tz('2022-03-12 21:00', 'America/Los_Angeles').tz('Australia/Sydney').format("dddd, MMMM Do YYYY, h:mm:ss a [(]Z[)]");
            this.test2 = moment.tz('America/Los_Angeles').format("dddd, MMMM Do YYYY, kk:mm:ss [(]Z[)]");
            this.$store.dispatch('timers/update');

            this.now = val;
        }
    }
}
</script>

<style scoped>
    .ongoingEvent {
        border: 1px solid green;
    }
</style>