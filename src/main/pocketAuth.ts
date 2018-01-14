import * as querystring from "querystring";
import * as url from "url";

import axios from "axios";
import { shell } from "electron";
import * as Koa from "koa";

export default class PocketAuth {
    protected static readonly redirectUri = "http://localhost:3000/";

    protected webServer: Koa;

    public constructor(public consumerKey: string) {
    }

    public getAccessToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            axios.post("https://getpocket.com/v3/oauth/request",
                {
                    consumer_key: this.consumerKey,
                    redirect_uri: PocketAuth.redirectUri
                },
                {
                    headers: { "X-Accept": "application/json" }
                }
            )
            .then((response) => {
                return response.data.code;
            })
            .then((requestToken: string) => {
                return new Promise<string>((resolve2, reject2) => {
                    this.webServer = new Koa();
                    this.webServer.use((ctx) => {
                        if (ctx.request.path === "/") {
                            ctx.response.body = "<html><body><script>window.close();</script></body></html>";
                            this.webServer = null;
                            resolve2(requestToken);
                        }
                    });
                    this.webServer.listen(3000);

                    shell.openExternal(this.authUrl(requestToken));
                });
            })
            .then((requestToken: string) => {
                return axios.post("https://getpocket.com/v3/oauth/authorize",
                    {
                        code: requestToken,
                        consumer_key: this.consumerKey
                    },
                    {
                        headers: { "X-Accept": "application/json" }
                    }
                );
            })
            .then((response) => {
                resolve(response.data.access_token);
            })
            .catch((error) => {
                if (error.response !== undefined && "x-error" in error.response.headers) {
                    reject(new Error(error.response.headers["x-error"]));
                }
                else {
                    reject(error);
                }
            });
        });
    }

    protected authUrl(requestToken: string): string {
        return url.format({
            hostname: "getpocket.com",
            pathname: "/auth/authorize",
            protocol: "https",
            search: querystring.stringify({
                redirect_uri: PocketAuth.redirectUri,
                request_token: requestToken
            }),
            slashes: true,
        });
    }
}
