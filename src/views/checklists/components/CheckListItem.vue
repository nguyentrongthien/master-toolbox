<template>

    <v-card @click="$emit('listSelected', value)" elevation="20">
        <v-img
            class="white--text align-end"
            gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.9)"
            height="200px"
            :src="checkList.img"
        >
            <v-app-bar flat color="rgba(0, 0, 0, 0)">

                <v-spacer></v-spacer>

            </v-app-bar>

            <v-card-title class="subtitle-1"><span>{{checkList.title}}</span></v-card-title>
        </v-img>

        <v-progress-linear :value="percent" height="17" color="rgb(0 111 1)" background-color="black">
            <span class="caption">{{progressText}}</span>
        </v-progress-linear>

    </v-card>
</template>

<script>
import moment from "moment-timezone";

export default {
    name: "CheckListItem",
    props: ['value', 'now'], // 'now' is the moment().unix() value
    data: () => ({
        previous: -1,
    }),
    methods: {
        cloneThisList() {
            this.$store.dispatch('checklists/cloneChecklist', this.value);
        },
        deleteThisList() {
            this.$store.commit('checklists/deleteList', this.value);
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
        },
        convertToReadablePast(duration) {
            let readable = '';
            let leftover = duration * -1;
            let hour = (leftover - (leftover % 3600)) / 3600;
            leftover = leftover % 3600;
            readable += hour > 0 ? (hour === 1 ? '1 hour ' : hour + ' hours ') : '';
            let minute = (leftover - (leftover % 60)) / 60;
            readable += minute > 0 ? (minute === 1 ? '1 minute ' : minute + ' minutes ') : '';
            leftover = leftover % 60;
            readable += (leftover > 0 ? (leftover > 1 ? leftover + ' seconds ' : leftover + ' second ') : '') + 'ago';
            return readable;
        },
        setImage() {
            this.$store.dispatch('checklists/requestImageForList', this.value);
            this.$router.push({path: '/cropper'});
        }
    },
    computed: {
        checkList() {
            let checklist = this.$store.getters['checklists/getCheckListById'](this.value);
            let scheduledTime = moment.tz(checklist.resetAtDate + ' ' + checklist.resetAtTime, checklist.timeZone).tz('Australia/Sydney');
            let fromNowInSeconds = scheduledTime.unix() - this.now;

            return {
                ...checklist,
                scheduled: moment.tz(checklist.resetAtDate + ' ' + checklist.resetAtTime, checklist.timeZone).format("dddd, MMMM Do YYYY, kk:mm:ss [(]z[)]"),
                local: scheduledTime.format("dddd, MMMM Do YYYY, kk:mm:ss [(]zz[)]"),
                fromNow: fromNowInSeconds < 0 ? this.convertToReadablePast(fromNowInSeconds) : this.convertToReadableDuration(fromNowInSeconds),
                fromNowInSeconds,
            }
        },
        percent() {
            return Math.ceil(
                (this.$store.getters['checklists/getIndexesOfCheckedItemsInListById'](this.value).length /
                    this.$store.getters['checklists/getCheckListById'](this.value, this.now).items.length) * 100
            )
        },
        progressText() {
            return this.$store.getters['checklists/getIndexesOfCheckedItemsInListById'](this.value).length + '/' +
                this.$store.getters['checklists/getCheckListById'](this.value, this.now).items.length + ' tasks done'
        }
    },
}
</script>

<style scoped>

</style>