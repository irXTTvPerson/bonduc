# 環境変数一覧

## プロジェクト共通

### BONDUC_ENV
__[required]__ 次の開発環境のどれかをさす：local, dev, stage, prod

## fe/web

### NEXT_PUBLIC_BE_WEB_URL
__[required]__ バックエンドのエンドポイントを```http://hoge.com:1234```形式で記述する

## be/web

### FE_WEB_URL
__[required]__ フロントエンドのエンドポイントを```http://hoge.com:1234```形式で記述する

### DATABASE_URL
__[required]__ DBのエンドポイントを```postgresql://user:password@localhost:5432/bonduc?schema=public```形式で記述する

### AWS_REGION
__[required]__ AWSのリージョン ```us-east-2```等

### AWS_CONFIRMATION_EMAIL_FROM
__[required]__ bonducからメールを送るときの送信元 email address

### AWS_ACCESS_KEY_ID
__[required]__ aws sdkのアクセストークン

### AWS_SECRET_ACCESS_KEY
__[required]__ aws sdkのアクセストークン

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
