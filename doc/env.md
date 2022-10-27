# 環境変数一覧

## プロジェクト共通

### NODE_ENV
__[required]__ productionかそれ以外を入れる

### BONDUC_ENV
__[required]__ 次の開発環境のどれかをさす：local, dev, stage, prod

### NEXT_PUBLIC_FE_WEB_URL
__[required]__ フロントエンドのエンドポイントを```http://hoge.com:1234```形式で記述する。表向きのbonducのドメインでもある

docker上のコンテナ間通信では、beは```http://fe:3000```のようにhostを設定するので注意

## fe/web

### NEXT_PUBLIC_BE_WEB_URL
__[required]__ バックエンドのエンドポイントを```http://hoge.com:1234```形式で記述する

### NEXT_PUBLIC_BE_WEB_URL_ON_SSR
__[required]__ バックエンドのエンドポイントを```http://hoge.com:1234```形式で記述する

docker上ではSSR時のfetchがコンテナ間通信になるのでhostを```http://be:3333```と設定するのに注意

## be/web

### JWT_SECRET_TOKEN
__[required]__ jwtの秘密鍵トークン。十分長いランダム文字列であるべき。

### DATABASE_URL
__[required]__ DBのエンドポイントを```postgresql://user:password@localhost:5432/bonduc?schema=public```形式で記述する

docker上では```localhost```をコンテナ名(```postgres```など)に読み替える必要があるので注意

### AWS_REGION
__[required]__ AWSのリージョン ```us-east-2```等

### AWS_CONFIRMATION_EMAIL_FROM
__[required]__ bonducからメールを送るときの送信元 email address

### AWS_ACCESS_KEY_ID
__[required]__ aws sdkのアクセストークン

### AWS_SECRET_ACCESS_KEY
__[required]__ aws sdkのアクセストークン

### COOKIE_SECRET_TOKEN
__[required]__ 署名つきCookieのトークン。十分長いランダム文字列であるべき。

### CORS_ORIGIN
__[required]__ corsで期待するoriginを```http://hoge.com:1234```形式で記述する

## inf/postgres

### POSTGRES_PASSWORD
__[optional: docker使用時にあると便利]__ DBのパスワード
  
### POSTGRES_USER
__[optional: docker使用時にあると便利]__ DBのユーザ名
  
### POSTGRES_DB
__[optional: docker使用時にあると便利]__ DBのデータベース名

### POSTGRES_HOSTNAME
__[optional: docker使用時にあると便利]__ DBのホスト名

### POSTGRES_PORT
__[optional: docker使用時にあると便利]__ DBのポート番号
