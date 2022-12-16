import { Test, TestingModule } from "@nestjs/testing";
import { prisma } from "../lib/prisma";
import { HTLResolver } from "./htl.resolver";
import { hash } from "../lib/hash";
import { Config } from "../config";
import { FollowRequestResolver } from "../follow/followRequest.resolver";
import { PodResolver } from "../pod/pod.resolver";
import { Account } from "@prisma/client";

describe("AuthService", () => {
  let htl: HTLResolver;
  let fr: FollowRequestResolver;
  let pd: PodResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowRequestResolver, PodResolver, HTLResolver]
    }).compile();

    htl = module.get(HTLResolver);
    fr = module.get(FollowRequestResolver);
    pd = module.get(PodResolver);
  });

  describe("Valid", () => {
    it("normal", async () => {
      // テストデータを作成する
      /*
      {
        const limit = 30;
        const account: Account[] = [];
        for (let i = 0; i < limit; i++) {
          const a = await prisma.account.create({
            data: {
              email: `${i}@b.c`,
              password: hash("password"),
              ip_address: ["127.0.0.1"],
              screen_name: `${i}_screen_name`,
              identifier_name: `${i}_identifier_name`,
              account_unique_uri: `${Config.corsOrigin}/${i}_identifier_name`,
              inbox: `${Config.corsOrigin}/${i}_identifier_name/inbox`,
              outbox: `${Config.corsOrigin}/${i}_identifier_name/outbox`,
              follower_uri: `${Config.corsOrigin}/${i}_identifier_name/follower`,
              following_uri: `${Config.corsOrigin}/${i}_identifier_name/following`
            }
          });
          account.push(a);
        }

        for (let i = 0; i < limit; i++) {
          for (let j = i; j > 0; j--) {
            await fr.createFollowRequest(account[j], account[i].identifier_name);
            await fr.acceptFollowRequest(account[i], account[j].identifier_name);
          }
        }
      }
      {
        const account = await prisma.account.findMany();
        const num_pods = 50;
        for (const a of account) {
          for (let i = 0; i < num_pods; i++) {
            await pd.createPod(a, `body ${i}`, i % 8 === 0 ? "following" : "global");
          }
          const pod = await prisma.pod.findMany({take: Math.trunc(num_pods / 3)});
          for (const p of pod) {
            await pd.createDpPod(a, p.id, "global");
          }
        }
      }
      */
      expect(0).not.toBeNull();
    });
  });
});
