import { ipcRenderer } from "electron";
import Vue from "vue";

/* tslint:disable:object-literal-sort-keys */
const app = new Vue({
    el: "#app",
    data: {
        googleAccessToken: ""
    },
    methods: {
        googleOAuth() {
            this.$data.googleAccessToken = "";
            ipcRenderer.send("google-oauth");
        }
    }
});
/* tslint:enable:object-literal-sort-keys */

ipcRenderer.on("google-oauth-reply", (event, accessToken) => {
    app.$data.googleAccessToken = accessToken;
});
