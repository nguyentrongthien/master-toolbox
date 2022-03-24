<template>
    <v-dialog v-model="open" max-width="500">

        <v-card>
            <v-card-title class="text-h5 font-weight-light">
                Add a new timer
            </v-card-title>

            <v-card-text>
                <v-combobox
                    label="Name of alert"
                    v-model="name"
                    :items="pastNames"
                    clearable
                    hide-details
                    prepend-icon="mdi-pencil-outline"
                    hide-selected
                ></v-combobox>
            </v-card-text>

            <v-card-text>

                <v-menu
                    ref="dateMenu"
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="picker.date"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="picker.date"
                            label="Pick a date"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker v-if="dateMenu" v-model="picker.date" @click:date="$refs.dateMenu.save(picker.date)"></v-date-picker>
                </v-menu>

                <v-menu
                    ref="timeMenu"
                    v-model="timeMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="picker.time"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="picker.time"
                            label="Pick a time"
                            prepend-icon="mdi-clock-time-four-outline"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                    </template>
                    <v-time-picker
                        v-if="timeMenu"
                        v-model="picker.time"
                        full-width
                        format="24hr"
                        scrollable
                        @click:minute="$refs.timeMenu.save(picker.time)"
                    ></v-time-picker>
                </v-menu>
                <v-select
                    v-model="zone"
                    :items="timeZones"
                    prepend-icon="mdi-earth"
                    label="Pick a timezone"
                ></v-select>

                <v-row>
                    <v-col cols="7">
                        <v-text-field
                            v-model="duration"
                            label="Duration"
                            type="number"
                            hide-details
                            prepend-icon="mdi-clock-time-four-outline"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="5">
                        <v-select v-model="durationUnit" :items="durationUnits" hide-details>

                        </v-select>
                    </v-col>
                </v-row>


                <v-row>
                    <v-col :cols="shouldAlert ? 4 : 7">
                        <v-switch
                            v-model="shouldAlert"
                            :label="shouldAlert ? 'Alert before' : 'Turn on alert'" hide-details
                        ></v-switch>
                    </v-col>
                    <v-col cols="3" v-show="shouldAlert">
                        <v-text-field
                            v-model="alert"
                            type="number"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="5" v-show="shouldAlert">
                        <v-select v-model="alertUnit" :items="durationUnits">

                        </v-select>
                    </v-col>
                </v-row>

            </v-card-text>

            <v-card-text>
                <v-textarea label="Description (optional)" class="mb-2" hide-details v-model="description"
                            outlined rows="4"></v-textarea>
            </v-card-text>


            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    text color="grey"
                    @click="open = false"
                >
                    Close
                </v-btn>
                <v-btn
                    color="green"
                    text
                    @click="addNewTimer"
                >
                    Done
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>


<script>
import moment from "moment-timezone";

export default {
    name: "NewTimerDialog",
    props: ['value'],
    data: () => ({
        name: '',
        description: '',
        zone: 'America/Los_Angeles',
        picker: {
            date: '',
            time: '',
        },
        timeMenu: false,
        dateMenu: false,
        duration: 10,
        durationUnit: 1,
        shouldAlert: false,
        alert: 10,
        alertUnit: 60,
        durationUnits: [
            {text: 'hours', value: 3600},
            {text: 'minutes', value: 60},
            {text: 'seconds', value: 1}
        ],
        timeZones: [
            {text: 'America - Los Angeles (PST)', value: 'America/Los_Angeles'},
            {text: 'Australia - Sydney (AEDT)', value: 'Australia/Sydney'}
        ]
    }),
    mounted() {
        this.resetInput();
    },
    methods: {
        addNewTimer() {
            this.$store.dispatch('timers/addNewTimer', {
                date: this.picker.date,
                time: this.picker.time + ':00',
                zone: this.zone,
                duration: this.duration * this.durationUnit,
                name: this.name,
                description: this.description,
                shouldAlert: this.shouldAlert,
                alertBefore: this.alert * this.alertUnit,
                alertSound: null,
            }).then();
            this.resetInput();
            this.open = false;
        },
        resetInput() {
            this.name = '';
            this.description = '';
            this.picker.date = moment().tz('America/Los_Angeles').format('YYYY-MM-DD');
            this.picker.time = moment().tz('America/Los_Angeles').format('hh:mm');
        },
    },
    computed: {
        open: {
            get() {
                return this.value
            },
            set(val) {
                this.$emit('input', val);
            }
        },
        pastNames() {
            return this.$store.getters['timers/pastNames'];
        }
    }
}
</script>

<style scoped>

</style>