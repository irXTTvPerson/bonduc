import { ExecutionContext, createParamDecorator, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { redis } from "../lib/redis";

export const SessionValidater = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const token = ctx.getContext().req.signedCookies["session"];
    if (!token) {
      console.error("cookie: session not found");
      throw new UnauthorizedException();
    }

    const account = await redis.get(token);
    if (!account) {
      console.error("account validate failed");
      throw new UnauthorizedException();
    }
    return JSON.parse(account);
  }
);
