import { ipcRenderer } from "electron";
import Vue from "vue";

/* tslint:disable:object-literal-sort-keys */
const app = new Vue({
    el: "#app",
    data: {
        googleAccessToken: "",
        googleErrorMessage: "",
        pocketAccessToken: "",
        pocketErrorMessage: "",
    },
    methods: {
        googleOAuth() {
            this.$data.googleAccessToken = "";
            this.$data.googleErrorMessage = "";
            ipcRenderer.send("google-oauth");
        },
        pocketOAuth() {
            this.$data.pocketAccessToken = "";
            this.$data.pocketErrorMessage = "";
            ipcRenderer.send("pocket-oauth");
        }
    }
});
/* tslint:enable:object-literal-sort-keys */

ipcRenderer.on("google-oauth-reply", (event, error, accessToken) => {
    if (error !== null) {
        app.$data.googleErrorMessage = error;
    }
    else {
        app.$data.googleAccessToken = accessToken;
    }
});

ipcRenderer.on("pocket-oauth-reply", (event, error, accessToken) => {
    if (error !== null) {
        app.$data.pocketErrorMessage = error;
    }
    else {
        app.$data.pocketAccessToken = accessToken;
    }
});
