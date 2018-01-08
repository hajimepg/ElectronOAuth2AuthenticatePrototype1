import { ipcRenderer } from "electron";
import Vue from "vue";

/* tslint:disable:object-literal-sort-keys */
const app = new Vue({
    el: "#app",
    data: {},
    methods: {
        oauth() {
            ipcRenderer.send("StartOAuth");
        }
    }
});
/* tslint:enable:object-literal-sort-keys */
