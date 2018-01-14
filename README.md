Electron OAuth プロトタイプ1
====

### 概要

以下のサービスのOAuth認証を行い、アクセストークンを取得します。

- Google
- Pocket
- Twitter

### 使い方

ルートディレクトリに`credentials.json`というファイルを作成し、各サービス用の情報を設定してください。

```json
{
    "google": {
        "client_id": "",
        "client_secret": ""
    },
    "pocket": {
        "consumer_key": ""
    },
    "twitter": {
        "consumer_key": "",
        "consumer_secret": ""
    }
}
```

その後にコマンドラインから

$ yarn webpack && yarn electron .

で起動します。
