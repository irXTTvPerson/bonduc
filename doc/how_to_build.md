# 動作確認手順

## local

- bonduc/src/fe/web/.envをenv.mdに従って作成する
- bonduc/src/be/web/.envをenv.mdに従って作成する
- postgresを起動する (on windows docker 起動例：```start docker run -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_USER=user -e POSTGRES_DB=bonduc -e POSTGRES_HOSTNAME=postgres -e POSTGRES_PORT=5432 postgres:latest```)
- DBのmigrateを実行```npx prisma migrate dev```
- フロントエンド起動```cd bonduc/src/fe/web/ && npm install && npm run dev```
- バックエンド起動```cd bonduc/src/be/web/ && npm install && npm run start:dev```