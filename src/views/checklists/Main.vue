<template>
    <v-container >
        <v-row>
            <v-col cols="4" v-for="id in checklistIds" :key="id">
                <CheckListItem :value="id" :now="now" @checkListUpdateRequested="updateCheckList" />
            </v-col>
        </v-row>

        <NewCheckListDialog v-model="newCheckListDialog" :list-id="listIdToBeUpdated" @listIdUpdated="listIdToBeUpdated = null" />

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
            <v-btn fab dark small color="green" @click="newCheckListDialog = !newCheckListDialog">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-speed-dial>
    </v-container>

</template>

<script>
import NewCheckListDialog from "./components/NewCheckListDialog";
import {mapGetters} from "vuex";
import CheckListItem from "./components/CheckListItem";

export default {
    name: "Main",
    components: {CheckListItem, NewCheckListDialog},
    data: () => ({
        settings: [],
        fab: false,
        listIdToBeUpdated: null,
        newCheckListDialog: false,
        now: 0,
    }),
    methods: {
        updateCheckList(id) {
            console.log(id);
            this.listIdToBeUpdated = id;
            this.newCheckListDialog = true;
        }
    },
    computed: {
        ...mapGetters(['nowInUnix']),
        checklistIds() {
            return this.$store.getters['checklists/getActiveCheckLists']
        }
    },
    watch: {
        nowInUnix(val) {
            this.now = val;
            this.$store.dispatch('checklists/update');
        }
    }
}
</script>

<style scoped>

</style>