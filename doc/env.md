# 環境変数一覧

## プロジェクト共通

### BONDUC_ENV
__[required]__ 次の開発環境のどれかをさす：local, dev, stage, prod

.env例：
```
BONDUC_ENV=local
```

## fe/web

### NEXT_PUBLIC_BE_WEB_URL
__[required]__ バックエンドのエンドポイントを```http://hoge.com:1234```形式で記述する

.env例：
```
NEXT_PUBLIC_BE_WEB_URL=http://localhost:3333
```

## be/web

### FE_WEB_URL
__[required]__ フロントエンドのエンドポイントを```http://hoge.com:1234```形式で記述する

### DATABASE_URL
__[required]__ DBのエンドポイントを```postgresql://user:password@localhost:5432/bonduc?schema=public```形式で記述する

.env例：
```
FE_WEB_URL=http://localhost:8080
DATABASE_URL=postgresql://user:password@localhost:5432/bonduc?schema=public
```

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

.env例：
```
POSTGRES_PASSWORD: password
POSTGRES_USER: user
POSTGRES_DB: bonduc
POSTGRES_HOSTNAME: postgres
POSTGRES_PORT: 5432
```