<template>
    <v-dialog v-model="open" max-width="500" persistent>
        <v-card >
            <v-toolbar
                color="red"
                dark
            >Event Incoming !!!</v-toolbar>
            <v-card-text class="pt-5">
                <v-container class="fill-height" fluid>
                    <v-row justify="center">
                        <v-col cols="auto">
                            <p class="headline text-center">{{alarmText}}</p>
                            <p class="caption text-center" v-if="secondaryText">{{secondaryText}}</p>
                        </v-col>
                    </v-row>
                    <audio tabindex="0" ref="alertPlayer" loop>
                        <source src="local-assets://alarm-001.wav">
                    </audio>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-btn block outlined color="red" class="darken-4" x-large @click="open = false">Stop Alarm</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script>
export default {
    name: "AlertDialog",
    data: () => ({

    }),
    methods: {
        play() {
            if (this.$refs.alertPlayer)
                this.$refs.alertPlayer.play();
        },
        pause() {
            if (this.$refs.alertPlayer)
                this.$refs.alertPlayer.pause();
        },
        stop() {
            if (this.$refs.alertPlayer) {
                this.$refs.alertPlayer.pause();
                this.$refs.alertPlayer.currentTime = 0;
            }
        }
    },
    beforeDestroy() {
        this.stop();
    },
    updated() {
        if (this.$store.getters['timers/eventsToAlert'].length) this.play();
    },
    computed: {
        open: {
            get() {
                return this.$store.getters['timers/eventsToAlert'].length;
            },
            set(val) {
                if (!val) {
                    this.pause();
                    this.$store.commit('timers/clearEventsToAlert');
                }
            }
        },
        alarmText() {
            if (this.$store.getters['timers/eventsToAlert'].length) {
                let event = this.$store.getters['timers/getEventById'](this.$store.getters['timers/eventsToAlert'][0]);
                return event.name;
            } else {
                return ''
            }
        },
        secondaryText() {
            if (this.$store.getters['timers/eventsToAlert'].length > 1)
                return '...and ' + (this.$store.getters['timers/eventsToAlert'].length - 1) + ' other(s)'
            else return null;
        }
    },
}
</script>

<style scoped>

</style>