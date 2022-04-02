<template>

    <v-app-bar
        flat
        color="rgba(0, 0, 0, 0)"
        elevation="8"
        dense
    >
        <v-toolbar-title class="text-h6 white--text pl-0">
            Photo Editor
        </v-toolbar-title>
        <i class="ml-2 caption" style="color:#3e3e3e">(adapted from https://github.com/fengyuanchen/photo-editor by <b>fengyuanchen</b>)</i>

        <v-spacer></v-spacer>

        <v-btn color="red" text @click.stop="$router.back()">
            cancel
        </v-btn>
        <v-btn dark icon>
            <v-icon>mdi-cloud-upload-outline</v-icon>
        </v-btn>

        <v-btn dark icon title="Undo (Ctrl + Z)" @click="$emit('change', 'restore')" :disabled="!data.previousUrl">
            <v-icon>mdi-undo</v-icon>
        </v-btn>

        <v-btn v-if="data.loaded && !data.cropping" dark icon title="Delete (Delete)"
               @click="$emit('change', 'remove')">
            <v-icon>mdi-delete</v-icon>
        </v-btn>

        <v-btn v-if="data.cropping" dark icon title="Cancel (Esc)" color="red"
               @click="$emit('change', 'clear')">
            <v-icon>mdi-close-circle-outline</v-icon>
        </v-btn>

        <v-btn v-if="data.cropping" dark icon title="OK (Enter)" color="green"
               @click="$emit('change', 'crop')">
            <v-icon>mdi-check-circle-outline</v-icon>
        </v-btn>

<!--        <v-btn v-if="downloadable && data.loaded" dark icon title="Download"-->
<!--               :download="data.name"-->
<!--               :href="data.url">-->
<!--            <v-icon>mdi-download</v-icon>-->
<!--        </v-btn>-->
        <v-btn v-if="canBeSaved && data.loaded" dark icon title="Download" color="green"
               @click="$emit('change', 'save')">
            <v-icon>mdi-content-save-outline</v-icon>
        </v-btn>

        <v-btn dark icon
               href="https://github.com/fengyuanchen/photo-editor"
               title="View on GitHub">
            <v-icon>mdi-github</v-icon>
        </v-btn>
    </v-app-bar>
</template>

<script>
export default {
    name: 'Navbar',
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            downloadable: typeof document.createElement('a').download !== 'undefined',
        };
    },
    methods: {
        click({ target }) {
            const action = target.getAttribute('data-action') || target.parentElement.getAttribute('data-action');
            if (action) {
                this.$emit('change', action);
            }
        },
    },
    computed: {
        canBeSaved() {
            return this.data.url.includes('data:image/png;base64');
        }
    }
};
</script>

<style scoped>

</style>