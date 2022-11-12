#!/usr/bin/env sh
sleep 1m
npx prisma migrate deploy
npm run start:prod