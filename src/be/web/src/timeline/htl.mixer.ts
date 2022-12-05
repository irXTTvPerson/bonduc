import { prisma, pool } from "../lib/prisma";
import { Config } from "../config";
import { Account, Pod, DpPod } from "@prisma/client";
import { HomeTimeline, Type } from "./htl.model";

type TimelineCommonBase = { id: string; account_id: string; created_at: Date; type: string };

const query = (following_place_holder: string, limit: number) =>
  `select
  id, account_id, created_at, 'pod' as type
from
  "Pod" p 
where 
    (account_id in (${following_place_holder}))
  and
    (visibility in ('anyone'::"PodVisibility", 'login'::"PodVisibility", 'global'::"PodVisibility", 'local'::"PodVisibility", 'follower'::"PodVisibility"))
union all
  select
    pod_id as id, account_id, created_at, 'dp' as type
  from
    "DpPod" p 
  where 
      (account_id in (${following_place_holder}))
    and
      (visibility in ('anyone'::"PodVisibility", 'login'::"PodVisibility", 'global'::"PodVisibility", 'local'::"PodVisibility", 'follower'::"PodVisibility"))
order by created_at desc
limit ${limit}`;

export class Mixer {
  async build(account: Account) {
    const limit = Config.limit.pods.find_at_once;
    const starttime = performance.now();
    const promise = [];

    const gen_place_holder = (num, offset = 0) => {
      let place_holder = "";
      for (let i = 0 + offset; i < num + offset; i++) place_holder += `$${i + 1},`;
      place_holder = place_holder.slice(0, -1);
      return place_holder;
    };

    // 投稿を取得する対象者(フォロー全員)を取得
    const target_list = await prisma.follow.findMany({
      where: { from_account_id: account.id },
      select: { to_account_id: true }
    });
    target_list.push({ to_account_id: account.id }); // 自分自身の投稿も対象にする
    const following_place_holder = gen_place_holder(target_list.length);

    // 対象者のpodとdpのidリストを取得
    const timeline: TimelineCommonBase[] = await prisma.$queryRawUnsafe(
      query(following_place_holder, limit),
      ...target_list.map((v) => v.to_account_id)
    );

    // dpを取得する
    const dp_list = [
      ...new Set(
        timeline.map((v) => {
          return { pod_id: v.id, account_id: v.account_id };
        })
      )
    ];
    const dp_place_holder_pod_id = gen_place_holder(dp_list.length);
    const dp_place_holder_account_id = gen_place_holder(dp_list.length, dp_list.length);
    const dp_pods: DpPod[] = await prisma.$queryRawUnsafe(
      `select * from "DpPod" p where pod_id in (${dp_place_holder_pod_id}) and account_id in (${dp_place_holder_account_id})`,
      ...dp_list.map((v) => v.pod_id),
      ...dp_list.map((v) => v.account_id)
    );

    // podを取得する
    const pod_list = [
      ...new Set([
        ...timeline
          .map((v) => (v.type === "pod" ? v.id : undefined))
          .filter((v) => v !== undefined),
        ...dp_pods.map((v) => v.pod_id)
      ])
    ];
    const pod_place_holder = gen_place_holder(pod_list.length);
    promise.push(
      pool[0].$queryRawUnsafe(
        `select * from "Pod" p where id in (${pod_place_holder})`,
        ...pod_list
      )
    );

    // podをfavしてるか取得する
    promise.push(
      pool[1].$queryRawUnsafe(
        `select pod_id from "Favorite" f where pod_id in (${pod_place_holder}) and account_id='${account.id}'`,
        ...pod_list
      )
    );

    const pods: Pod[] = await promise[0];
    const favs: { pod_id: string }[] = await promise[1];

    // pod, dpのaccount_idを取得する
    const account_list = [
      ...new Set([...timeline.map((v) => v.account_id), ...pods.map((v) => v.account_id)])
    ];
    const account_place_holder = gen_place_holder(account_list.length);
    const accounts: Account[] = await prisma.$queryRawUnsafe(
      `select * from "Account" a where id in (${account_place_holder})`,
      ...account_list
    );

    const result: HomeTimeline[] = timeline.map((v) => {
      const ret = {};
      switch (v.type) {
        case "dp": {
          const dp = dp_pods.find((e) => e.pod_id === v.id && e.account_id === v.account_id);
          const dp_from = accounts.find((e) => e.id === v.account_id);
          const pod = pods.find((e) => e.id === dp.pod_id);
          const pod_from = accounts.find((e) => e.id === pod.account_id);
          const fav = favs.find((e) => e.pod_id === pod.id);
          ret["type"] = v.type as Type;
          ret["dpPod"] = dp;
          ret["dpPod"]["from"] = dp_from;
          ret["dpPod"]["body"] = pod;
          ret["dpPod"]["body"]["favorited"] = fav ? true : false;
          ret["dpPod"]["body"]["mypod"] = pod_from.id === account.id ? true : false;
          ret["dpPod"]["body"]["from"] = pod_from;
          return ret as HomeTimeline;
        }
        case "pod": {
          const pod = pods.find((e) => e.id === v.id);
          const pod_from = accounts.find((e) => e.id === pod.account_id);
          const fav = favs.find((e) => e.pod_id === pod.id);
          ret["type"] = v.type as Type;
          ret["pod"] = pod;
          ret["pod"]["favorited"] = fav ? true : false;
          ret["pod"]["mypod"] = pod_from.id === account.id ? true : false;
          ret["pod"]["from"] = pod_from;
          return ret as HomeTimeline;
        }
      }
    }) as HomeTimeline[];

    const endtime = performance.now();
    console.log("getHTL elapsed: ", endtime - starttime);

    return result;
  }
}
