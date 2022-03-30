<template>
    <v-dialog v-model="open" max-width="550">

        <v-card tag="form" @submit.prevent="createOrUpdateCheckList">
            <v-card-title class="text-h5 font-weight-light">
                {{ listId ? 'Editing list' : 'Add a new timer' }}
            </v-card-title>

            <v-card-text>
                <v-text-field
                    label="List's Name"
                    v-model="title"
                    clearable
                    prepend-icon="mdi-pencil-outline"
                ></v-text-field>


                <v-row>
                    <v-col :cols="repeatable ? 4 : 7">
                        <v-switch
                            v-model="repeatable"
                            :label="repeatable ? 'Repeat every' : 'Not repeatable'"
                        ></v-switch>
                    </v-col>
                    <v-col cols="3" v-show="repeatable">
                        <v-text-field
                            v-model="resetInterval"
                            type="number"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="5" v-show="repeatable">
                        <v-select v-model="resetIntervalUnit" :items="resetIntervalUnits">

                        </v-select>
                    </v-col>
                </v-row>

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
                            v-show="repeatable"
                            v-model="picker.time"
                            label="Starting at"
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
                            v-show="repeatable"
                            label="Of date"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker v-if="dateMenu" v-model="picker.date" @click:date="$refs.dateMenu.save(picker.date)"></v-date-picker>
                </v-menu>

                <v-select v-show="repeatable"
                    v-model="timeZone"
                    :items="timeZones"
                    prepend-icon="mdi-earth"
                    label="For timezone"
                ></v-select>
            </v-card-text>

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
                    @click="createOrUpdateCheckList"
                >
                    Done
                </v-btn>
            </v-card-actions>

            <button type="submit" class="d-none"></button>
        </v-card>
    </v-dialog>

</template>

<script>
import moment from "moment-timezone";

export default {
    name: "NewCheckListDialog",
    props: ['value', 'listId'],
    data: () => ({
        title: '',
        description: '',
        repeatable: false,
        resetInterval: 1,
        resetIntervalUnit: 86400,
        resetIntervalUnits: [
            {text: 'days', value: 86400},
            {text: 'hours', value: 3600},
            {text: 'minutes', value: 60},
            {text: 'seconds', value: 1}
        ],
        items: [],
        picker: {
            date: '',
            time: '00:00',
        },
        timeMenu: false,
        dateMenu: false,
        timeZone: 'America/Los_Angeles',
        timeZones: [
            {text: 'America - Los Angeles (PST)', value: 'America/Los_Angeles'},
            {text: 'Australia - Sydney (AEDT)', value: 'Australia/Sydney'}
        ]
    }),
    mounted() {
        this.resetInput();
    },
    methods: {
        createOrUpdateCheckList() {
            this.$store.commit('checklists/createOrUpdateCheckList', {
                id: this.listId,
                title: this.title,
                description: this.description,
                repeatable: this.repeatable,
                resetAtTime: this.picker.time,
                resetAtDate: this.picker.date,
                timeZone: this.timeZone,
                resetInterval: this.resetInterval,
                resetIntervalUnit: this.resetIntervalUnit,
                items: this.items,
            });
            this.open = false;
        },
        resetInput() {
            this.title = '';
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
                this.$emit('listIdUpdated');
            }
        },
        pastNames() {
            return this.$store.getters['timers/pastNames'];
        }
    },
    watch: {
        open(val) {
            if (val) {
                let checklist = this.listId ? this.$store.getters['checklists/getCheckListById'](this.listId) : null;
                this.title = checklist ? checklist.title : '';
                this.description = checklist ? checklist.description : '';
                this.repeatable = checklist ? checklist.repeatable : false;
                this.resetInterval = checklist ? checklist.resetInterval : 1;
                this.resetIntervalUnit = checklist ? checklist.resetIntervalUnit : 60;
                this.picker.date = checklist ? checklist.resetAtDate :
                    moment().tz('America/Los_Angeles').format('YYYY-MM-DD');
                this.picker.time = checklist ? checklist.resetAtTime :
                    moment().tz('America/Los_Angeles').format('hh:mm');
                this.timeZone = checklist ? checklist.timeZone : 'America/Los_Angeles';
                this.items = checklist ? checklist.items : [];
            }
        }
    }
}
</script>

<style scoped>

</style>