import { ExecutionContext, createParamDecorator, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { client } from "../lib/redis";

export const SessionValidater = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const token = ctx.getContext().req.signedCookies["session"];
    if (!token) {
      throw new UnauthorizedException();
    }

    const redis = await client();
    const account = await redis.get(token);
    if (!account) {
      console.error("account validate failed");
      throw new UnauthorizedException();
    }
    await redis.disconnect();
    return JSON.parse(account);
  }
);
