import { ipcRenderer } from "electron";
import Vue from "vue";

/* tslint:disable:object-literal-sort-keys */
const app = new Vue({
    el: "#app",
    data: {
        googleAccessToken: "",
        googleErrorMessage: "",
    },
    methods: {
        googleOAuth() {
            this.$data.googleAccessToken = "";
            this.$data.googleErrorMessage = "";
            ipcRenderer.send("google-oauth");
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
