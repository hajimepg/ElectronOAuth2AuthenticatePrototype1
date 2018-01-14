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
        twitterAccessToken: "",
        twitterAccessTokenSecret: "",
        twitterErrorMessage: "",
    },
    methods: {
        googleAuth() {
            this.$data.googleAccessToken = "";
            this.$data.googleErrorMessage = "";
            ipcRenderer.send("google-auth");
        },
        pocketAuth() {
            this.$data.pocketAccessToken = "";
            this.$data.pocketErrorMessage = "";
            ipcRenderer.send("pocket-auth");
        },
        twitterAuth() {
            this.$data.twitterAccessToken = "";
            this.$data.twitterAccessTokenSecret = "";
            this.$data.twitterErrorMessage = "";
            ipcRenderer.send("twitter-auth");
        },
    }
});
/* tslint:enable:object-literal-sort-keys */

ipcRenderer.on("google-auth-reply", (event, error, accessToken) => {
    if (error !== null) {
        app.$data.googleErrorMessage = error;
    }
    else {
        app.$data.googleAccessToken = accessToken;
    }
});

ipcRenderer.on("pocket-auth-reply", (event, error, accessToken) => {
    if (error !== null) {
        app.$data.pocketErrorMessage = error;
    }
    else {
        app.$data.pocketAccessToken = accessToken;
    }
});

ipcRenderer.on("twitter-auth-reply", (event, error, accessToken, accessTokenSecret) => {
    if (error !== null) {
        app.$data.twitterErrorMessage = error;
    }
    else {
        app.$data.twitterAccessToken = accessToken;
        app.$data.twitterAccessTokenSecret = accessTokenSecret;
    }
});
