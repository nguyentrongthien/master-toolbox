<template>
    <v-container fluid>

        <v-row>
            <v-col xl="7" lg="5" md="5" sm="5" cols="12">

                <v-fade-transition group class="row" mode="out-in" hide-on-leave leave-absolute>
                    <v-col xl="4" lg="6" md="12" cols="12" v-for="id in checklistIds" :key="id" v-show="selectedListId !== id">
                        <CheckListItem :value="id" :now="now" @listSelected="selectedListId = arguments[0]" />
                    </v-col>
                </v-fade-transition>
                <v-row>
                </v-row>
            </v-col>
            <v-col xl="5" lg="7" md="7" sm="7" cols="12">
                <CheckListItemDetail v-if="selectedListId" :value="selectedListId" :now="now"
                                     @checkListUpdateRequested="updateCheckList" @listDeletionRequested="deleteList"/>
            </v-col>
        </v-row>

        <NewCheckListDialog v-model="newCheckListDialog" :list-id="listIdToBeUpdated"
                            @listIdUpdated="listIdToBeUpdated = null"/>

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
import CheckListItemDetail from "./components/CheckListItemDetail";

export default {
    name: "Main",
    components: {CheckListItemDetail, CheckListItem, NewCheckListDialog},
    data: () => ({
        settings: [],
        fab: false,
        listIdToBeUpdated: null,
        newCheckListDialog: false,
        selectedListId: null,
        now: 0,
    }),
    methods: {
        updateCheckList(id) {
            console.log(id);
            this.listIdToBeUpdated = id;
            this.newCheckListDialog = true;
        },
        deleteList(listId) {
            console.log(listId);
            if (this.selectedListId === listId) this.selectedListId = null;
            this.$store.commit('checklists/deleteList', listId);
        },
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