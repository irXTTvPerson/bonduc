# 動作確認手順

## local

- bonduc/src/fe/web/.envを```{root}/doc/env.md```に従って作成する
- bonduc/src/be/web/.envを```{root}/doc/env.md```に従って作成する
- postgresを起動する (on windows docker 起動例：```start docker run -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=user -e POSTGRES_DB=bonduc -e POSTGRES_HOSTNAME=postgres -e POSTGRES_PORT=5432 postgres:latest```)
- DBのmigrateを実行```cd {root}/src/be/web/ && npx prisma migrate dev```
- フロントエンド起動```cd {root}/src/fe/web/ && npm install && npm run dev```
- バックエンド起動```cd {root}/src/be/web/ && npm install && npm run start:dev```

## aws

- IAMでAdd users
  - 事前にsesのsend emailだけ許可するポリシーを作成しておく
  - 作成したユーザーにそのポリシーを適用する
  - access keyでAccess key IDとSecret access keyを確認できるのでメモしておく
- awsでsesをセットアップする
  - create identity(Identity type: email address)
  - ses accountはsandboxにありverified email以外に送信できない制限があるのでAccount dashboardからRequest production accessする

## docker

- docker-compose build
- docker-compose up

コンテナ間通信が走る箇所はhostをコンテナ名に適宜読み替える必要があるので注意。env.mdに詳細を記した。