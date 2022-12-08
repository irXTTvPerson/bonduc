import { ExecutionContext, createParamDecorator, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Account } from "@prisma/client";
import { Config } from "../config";

export const SessionValidater = createParamDecorator((data: any, context: ExecutionContext) => {
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
  return { req, token };
});

export const accountValidator = async (req, token, redis) => {
  const account = await redis.get(`session/${token}`);
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
};
