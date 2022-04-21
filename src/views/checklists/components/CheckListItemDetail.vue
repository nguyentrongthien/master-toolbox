<template>

    <v-card>
        <v-list-item three-line>
            <v-list-item-avatar
                tile
                size="150"
                color="grey"
            >
                <v-img :src="checkList.img"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>

                <v-list-item-title class="text-h5 mb-4">
                    {{checkList.title}}
                    <v-icon color="teal" v-show="listCompleted">
                        mdi-check
                    </v-icon>

                </v-list-item-title>
                <div class="text-overline mb-1">
                    Until reset: {{ checkList.fromNow }}
                </div>
                <v-list-item-subtitle>
                    <v-menu bottom left offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn dark outlined small v-bind="attrs" v-on="on">
                                options
                            </v-btn>
                        </template>

                        <v-list dense>
                            <v-list-item @click="$emit('checkListUpdateRequested', value)">
                                <v-list-item-title>Edit list</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="cloneThisList">
                                <v-list-item-title>Clone list</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="setImage">
                                <v-list-item-title>Set image</v-list-item-title>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item  @click="adding = !adding">
                                <v-list-item-title class="green--text">Add new item</v-list-item-title>
                            </v-list-item>
                            <v-divider></v-divider>
                            <v-list-item @click="deleteThisList">
                                <v-list-item-title class="red--text">Delete list</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-list-item-subtitle>
            </v-list-item-content>

        </v-list-item>

        <v-list
            subheader
            two-line
            flat
            v-show="adding"
        >
            <v-divider></v-divider>
            <v-list-item>

                <v-list-item-content>
                    <v-form ref="form" @submit.prevent="addNewItem" v-model="isFormValid">
                        <v-text-field label="Item's Title" v-model="newItemTitle" :rules="newItemTitleRules"
                                      placeholder="A title for the task" autofocus>
                        </v-text-field>
                        <v-text-field label="Item's Description" v-model="newItemDescription" hide-details
                                      placeholder="A short description for the task">
                        </v-text-field>

                        <button type="submit" class="d-none"></button>
                    </v-form>
                </v-list-item-content>
            </v-list-item>
            <v-list-item>
                <v-btn text color="orange" @click.stop="adding = false" outlined>cancel</v-btn>
                <v-btn text class="ml-2" @click.stop="resetForm">
                    reset
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn text color="green" @click.stop="addNewItem" outlined>done</v-btn>
            </v-list-item>
            <v-divider></v-divider>
        </v-list>

        <v-expansion-panels v-model="panels">
            <v-expansion-panel>
                <v-expansion-panel-header disable-icon-rotate>
                    <v-progress-linear :value="percent" height="17" color="rgb(0 111 1)" background-color="black">
                        <span class="caption">{{progressText}}</span>
                    </v-progress-linear>
                    <template v-slot:actions>
                        <v-icon color="teal" v-show="false">
                            mdi-check
                        </v-icon>
                    </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-list
                        subheader
                        two-line
                        flat
                    >
                        <v-list-item-group
                            v-model="checked"
                            multiple
                        >
                            <v-list-item v-for="(item, index) in checkList.items" :key="index" class="px-0">
                                <template v-slot:default="{ active, }">
                                    <v-list-item-action>
                                        <v-checkbox
                                            :input-value="active"
                                            color="primary"
                                        ></v-checkbox>
                                    </v-list-item-action>

                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                        <v-list-item-subtitle v-if="item.description">{{ item.description }}</v-list-item-subtitle>
                                        <v-list-item-subtitle v-else class="grey--text darken-4"><i>No description provided</i></v-list-item-subtitle>
                                    </v-list-item-content>
                                    <v-list-item-icon>
                                        <v-btn color="red" icon @click.stop="removeItem(index)" small>
                                            <v-icon small>mdi-close</v-icon>
                                        </v-btn>
                                    </v-list-item-icon>
                                </template>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>

    </v-card>
</template>

<script>
import moment from "moment-timezone";

export default {
    name: "CheckListItemDetail",
    props: [
        'value', // 'value' is the id of the selected checklist
        'now' // 'now' is the moment().unix() value
    ],
    data: () => ({
        panels: 0,
        adding: false,
        deleting: false,
        isFormValid: true,
        newItemTitle: '',
        newItemTitleRules: [
            v => !!v || 'Title is required',
            v => (v && v.length <= 30) || 'Name must be less than 30 characters',
        ],
        newItemDescription: '',
        listCompleted: false,
        previous: -1,
    }),
    methods: {
        addNewItem() {
            this.validate();
            if (this.isFormValid) {
                this.$store.commit('checklists/addNewItemToList', {
                    id: this.value,
                    title: this.newItemTitle,
                    description: this.newItemDescription
                })
                this.resetForm();
            }
        },
        removeItem(itemIndex) {
            this.$store.commit('checklists/deleteItemFromList', {
                id: this.value,
                itemIndex
            })
        },
        cloneThisList() {
            this.$store.dispatch('checklists/cloneChecklist', this.value);
        },
        deleteThisList() {
            this.$emit('listDeletionRequested', this.value);
        },
        resetForm() {
            this.$refs.form.reset();
        },
        validate () {
            this.$refs.form.validate();
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
        checked: {
            get() {
                return this.$store.getters['checklists/getCheckListById'](this.value, this.now).items.reduce((acc, item, index) => {
                    if (item.checked) acc.push(index);
                    return acc;
                }, []);
            },
            set(val) {
                this.$store.dispatch('checklists/updateCheckedItems', {
                    listId: this.value,
                    indexes: val,
                })
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
    watch: {
        checked(val) {
            if (val.length !== this.previous) {
                let completed = this.$store.getters['checklists/getCheckListById'](this.value).items.length === val.length;
                this.listCompleted = completed;
                this.panels = completed ? null : 0;
                this.previous = val.length;
            }
        }
    }
}
</script>

<style scoped>

</style>