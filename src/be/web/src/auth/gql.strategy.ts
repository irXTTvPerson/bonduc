import { ExecutionContext, createParamDecorator, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { redis } from "../lib/redis";
import { Account } from "@prisma/client";
import { Config } from "../config";

export const SessionValidater = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const token = ctx.getContext().req.signedCookies["session"];
    const req = ctx.getContext().req;
    if (!token) {
      console.error("cookie: session not found");
      if (Config.gql.logging) {
        console.log("[!", new Date(), req.ip, req.headers, req.body, "]");
      }
      throw new UnauthorizedException();
    }

    const account = await redis.get(token);
    if (!account) {
      console.error("account validate failed");
      if (Config.gql.logging) {
        console.log("[!", new Date(), req.ip, req.headers, req.body, "]");
      }
      throw new UnauthorizedException();
    }

    const a: Account = JSON.parse(account);
    if (Config.gql.logging) {
      console.log("[", new Date(), req.ip, a, req.headers, req.body, "]");
    }
    return a;
  }
);
