import * as querystring from "querystring";
import * as url from "url";

import { shell } from "electron";
import * as Koa from "koa";
import { OAuth } from "oauth";

interface IIntermediateData1 {
    oauthToken: string;
    oauthTokenSecret: string;
}

interface IIntermediateData2 extends IIntermediateData1 {
    oauthVerifier: string;
}

interface IResult {
    accessToken: string;
    accessTokenSecret: string;
}

export default class TwitterAuth {
    protected static readonly redirectUri = "http://localhost:3000/";

    protected oauthClient: OAuth;
    protected webServer: Koa;

    public constructor(public consumerKey: string, public consumerSecret: string) {
        this.oauthClient = new OAuth(
            "https://api.twitter.com/oauth/request_token",
            "https://api.twitter.com/oauth/access_token",
            this.consumerKey,
            this.consumerSecret,
            "1.0",
            TwitterAuth.redirectUri,
            "HMAC-SHA1"
        );
    }

    public getAccessToken(): Promise<IResult> {
        return new Promise<IResult>((resolve, reject) => {
            this.getOAuthRequestToken()
            .then((data) => {
                return new Promise<IIntermediateData2>((resolve2, reject2) => {
                    this.webServer = new Koa();
                    this.webServer.use((ctx) => {
                        if (ctx.request.path === "/") {
                            ctx.response.body = "redirect back application.";
                            this.webServer = null;
                            resolve2({
                                oauthToken: data.oauthToken,
                                oauthTokenSecret: data.oauthTokenSecret,
                                oauthVerifier: ctx.request.query.oauth_verifier
                            });
                        }
                    });
                    this.webServer.listen(3000);

                    shell.openExternal(this.authUrl(data.oauthToken));
                });
            })
            .then((data) => {
                this.oauthClient.getOAuthAccessToken(
                    data.oauthToken,
                    data.oauthTokenSecret,
                    data.oauthVerifier,
                    (error, accessToken, accessTokenSecret, results) => {
                        if (error !== null) {
                            reject(new Error(error.data));
                            return;
                        }

                        resolve({ accessToken, accessTokenSecret });
                    }
                );
            })
            .catch((error) => {
                reject(error);
                return;
            });
        });
    }

    protected getOAuthRequestToken() {
        return new Promise<IIntermediateData1>((resolve, reject) => {
            this.oauthClient.getOAuthRequestToken((error, oauthToken, oauthTokenSecret, results) => {
                if (error !== null) {
                    const errorData = JSON.parse(error.data);
                    reject(new Error(errorData.errors[0].message));
                    return;
                }

                resolve({ oauthToken, oauthTokenSecret });
            });
        });
    }

    protected authUrl(oauthToken: string): string {
        return url.format({
            hostname: "twitter.com",
            pathname: "/oauth/authenticate",
            protocol: "https",
            search: querystring.stringify({
                oauth_token: oauthToken
            }),
            slashes: true,
        });
    }
}
