<template>
    <v-system-bar fixed app
                  dark>
        <v-btn small icon>
            <v-icon small>mdi-home</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn small icon>
            <v-icon small>mdi-home</v-icon>
        </v-btn>
        <v-divider vertical></v-divider>
        <template v-if="downloadQueue.length">
            <span class="mr-2"><b>Downloading: </b>{{ downloadQueue[0].name }}</span>
            <v-progress-linear style="width: 100px" :value="downloadQueue[0].progress"></v-progress-linear>
            <span class="ml-1">{{ downloadQueue[0].totalProgress }}</span>
        </template>
        <template v-else>
            <span>No item in download queue</span>
        </template>
    </v-system-bar>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "Systembar",
    computed: {
        ...mapGetters('downloads', ['getCurrentItem', 'getQueue']),
        downloadQueue() {
            return this.getCurrentItem ? [
                {
                    name: this.getCurrentItem.name,
                    // progress: item.currentTotal === 0 ? 0 : Math.ceil((item.currentLoaded/item.currentTotal) * 100),
                    progress: Math.ceil((this.getCurrentItem.downloadedFiles.length/this.getCurrentItem.urls.length) * 100),
                    totalProgress: this.getCurrentItem.downloadedFiles.length + '/' + this.getCurrentItem.urls.length,
                    hash: this.getCurrentItem.hash
                }
            ] : [];
        },
        queueCount() {
            return this.getQueue.filter(item => !item.completed).length;
        }

    }
}
</script>

<style scoped>

</style>