import * as querystring from "querystring";
import * as url from "url";

import axios from "axios";
import { BrowserWindow, shell } from "electron";

export default class PocketOAuth {
    protected static readonly redirectUri = "http://localhost/";

    public constructor(public consumerKey: string) {
    }

    public getAccessToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            axios.post("https://getpocket.com/v3/oauth/request",
                {
                    consumer_key: this.consumerKey,
                    redirect_uri: PocketOAuth.redirectUri
                },
                {
                    headers: { "X-Accept": "application/json" }
                }
            )
            .then((response) => {
                return response.data.code;
            })
            .catch((error) => {
                if (error.response !== undefined && "x-error" in error.response.headers) {
                    reject(new Error(error.response.headers["x-error"]));
                }
                else {
                    reject(error);
                }
            })
            .then((requestToken: string) => {
                shell.openExternal(this.oauthUrl(requestToken));
            });
        });
    }

    protected oauthUrl(requestToken: string): string {
        return url.format({
            hostname: "getpocket.com",
            pathname: "/auth/authorize",
            protocol: "https",
            search: querystring.stringify({
                redirect_uri: PocketOAuth.redirectUri,
                request_token: requestToken
            }),
            slashes: true,
        });
    }
}
