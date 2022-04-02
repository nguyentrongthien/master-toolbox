<template>

    <v-container fluid>
        <navbar
            :data="data"
            @change="change"
        />
        <div class="main">

            <editor
                v-if="data.loaded"
                ref="editor"
                :data="data"
            />
            <loader
                v-else
                ref="loader"
                :data="data"
            />
        </div>


        <v-dialog
            :value="$store.getters['editor/isWaitingForIPCMain']"
            persistent
            width="300"
        >
            <v-card
                color="primary"
                dark
            >
                <v-card-text>
                    Saving image
                    <v-progress-linear
                        indeterminate
                        color="white"
                        class="mb-0"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
            :value="$store.getters['editor/isDone']"
            persistent
            max-width="290"
        >
            <v-card>
                <v-card-title class="text-h5">
                    Success
                </v-card-title>
                <v-card-text>Image has been cropped and saved successfully.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="$router.back()"
                    >
                        Alrighty!
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


    </v-container>
</template>

<script>
import Editor from "./components/Editor";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";

export default {
    name: "Main",
    components: {Loader, Navbar, Editor},
    data() {
        return {
            data: {
                cropped: false,
                cropping: false,
                loaded: false,
                name: '',
                previousUrl: '',
                type: '',
                url: '',
            },
        };
    },
    destroyed() {
        this.$store.commit('editor/setDone');
        this.$store.commit('editor/setCurrentImageEditingJob', {});
    },
    methods: {
        change(action) {
            const { editor } = this.$refs;
            switch (action) {
                case 'crop':
                    editor.crop();
                    break;
                case 'clear':
                    editor.clear();
                    break;
                case 'restore':
                    editor.restore();
                    break;
                case 'remove':
                    editor.reset();
                    break;
                case 'save':
                    editor.save();
                    break;
                default:
            }
        },
    },
}
</script>

<style scoped>

.app {
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    right: 0;
}
.header {
    background-color: #666;
    height: 3rem;
    overflow: hidden;
    padding-left: 1rem;
    padding-right: 1rem;
    position: relative;
    z-index: 1;
}
@media (min-width: 768px) {
    .header {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
}
.title {
    color: #fff;
    display: block;
    float: left;
    font-size: 1.125rem;
    line-height: 3rem;
}
.main {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 3rem;
}
</style>