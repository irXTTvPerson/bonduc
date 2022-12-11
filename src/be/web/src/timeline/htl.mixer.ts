import { Config } from "../config";
import { Account, Pod, DpPod, QpPod } from "@prisma/client";
import { HomeTimeline, Type } from "./htl.model";
import { DBService } from "../db/db.service";

type TimelineCommonBase = { id: string; account_id: string; created_at: Date; type: string };

const defaultVisibility = `visibility in ('anyone'::"PodVisibility", 'login'::"PodVisibility", 'global'::"PodVisibility", 'local'::"PodVisibility", 'follower'::"PodVisibility")`

const query = (following_place_holder: string, limit: number) =>
  `select
  id, account_id, created_at, 'pod' as type
from
  "Pod" p 
where 
    (account_id in (${following_place_holder}))
  and
    (${defaultVisibility})
union all
  select
    id, account_id, created_at, 'dp' as type
  from
    "DpPod" p 
  where 
      (account_id in (${following_place_holder}))
    and
      (${defaultVisibility})
union all
  select
    id, account_id, created_at, 'qp' as type
  from
    "QpPod" p
  where
      (account_id in (${following_place_holder}))
    and
      (${defaultVisibility})
order by created_at desc
limit ${limit}`;

export class Mixer {
  constructor(private readonly dbSerVice: DBService) {}

  private gen_place_holder(num) {
    let place_holder = "";
    for (let i = 0; i < num; i++) place_holder += `$${i + 1},`;
    place_holder = place_holder.slice(0, -1);
    return place_holder;
  }

  private async getTimelineCommonBase(account: Account) {
    const limit = Config.limit.pods.find_at_once;

    // 投稿を取得する対象者(フォロー全員)を取得
    const target_list = await this.dbSerVice.prisma.follow.findMany({
      where: { from_account_id: account.id },
      select: { to_account_id: true }
    });
    target_list.push({ to_account_id: account.id }); // 自分自身の投稿も対象にする
    const target_list_place_holder = this.gen_place_holder(target_list.length);

    // 対象者のpodとdpとqpのidリストを取得
    const timeline: TimelineCommonBase[] = await this.dbSerVice.prisma.$queryRawUnsafe(
      query(target_list_place_holder, limit),
      ...target_list.map((v) => v.to_account_id)
    );

    return timeline;
  }

  private async getDpPods(timeline: TimelineCommonBase[]) {
    const dp_list = [
      ...new Set(
        timeline
          .map((v) => (v.type === "dp" ? v.id : undefined))
          .filter((v) => v !== undefined)
      )
    ];
    const dp_place_holder = this.gen_place_holder(dp_list.length);
    let dp_pods: DpPod[] = [];
    if (dp_list.length > 0) {
      dp_pods = await this.dbSerVice.pool[0].$queryRawUnsafe(
        `select * from "DpPod" p where id in (${dp_place_holder})`,
        ...dp_list
      );
    }
    return dp_pods;
  }

  private async getQpPods(timeline: TimelineCommonBase[]) {
    const qp_list = [
      ...new Set(
        timeline
          .map((v) => (v.type === "qp" ? v.id : undefined))
          .filter((v) => v !== undefined)
      )
    ];
    const qp_place_holder = this.gen_place_holder(qp_list.length);
    let qp_pods: QpPod[] = [];
    if (qp_list.length > 0) {
      qp_pods = await this.dbSerVice.pool[1].$queryRawUnsafe(
        `select * from "QpPod" p where id in (${qp_place_holder})`,
        ...qp_list
      );
    }
    return qp_pods;
  }

  private async getPodsAndFavs(timeline: TimelineCommonBase[], dp_pods: DpPod[], qp_pods: QpPod[], account: Account) {
    const pool = this.dbSerVice.pool;
    const promise = [];
    const pod_list = [
      ...new Set([
        ...timeline
          .map((v) => (v.type === "pod" ? v.id : undefined))
          .filter((v) => v !== undefined),
        ...dp_pods.map((v) => v.rp_id),
        ...qp_pods.map((v) => v.id),
      ])
    ];
    const pod_place_holder = this.gen_place_holder(pod_list.length);
    let pods: Pod[] = [];
    let favs: { rp_id: string }[] = [];

    if (pod_list.length > 0) {
      // podを取得する
      promise.push(
        pool[0].$queryRawUnsafe(
          `select * from "Pod" p where id in (${pod_place_holder})`,
          ...pod_list
        )
      );

      // podをfavしてるか取得する
      promise.push(
        pool[1].$queryRawUnsafe(
          `select rp_id from "Favorite" f where rp_id in (${pod_place_holder}) and account_id='${account.id}'`,
          ...pod_list
        )
      );

      pods = await promise[0];
      favs = await promise[1];
    }
    return { pods, favs };
  }

  private async getAccounts(timeline: TimelineCommonBase[], pods: Pod[]) {
    const account_list = [
      ...new Set([...timeline.map((v) => v.account_id), ...pods.map((v) => v.account_id)])
    ];
    const account_place_holder = this.gen_place_holder(account_list.length);
    let accounts: Account[] = [];

    if (account_list.length > 0) {
      accounts = await this.dbSerVice.prisma.$queryRawUnsafe(
        `select * from "Account" a where id in (${account_place_holder})`,
        ...account_list
      );
    }
    return accounts;
  }

  private generateQp(
    v: TimelineCommonBase,
    pods: Pod[],
    qp_pods: QpPod[],
    accounts: Account[],
    account: Account,
    favs: { rp_id: string }[]
  ) {
    const ret = {};
    const qp = qp_pods.find((e) => e.id === v.id);
    const qp_from = accounts.find((e) => e.id === v.account_id);
    const pod = pods.find((e) => e.id === qp.pod_id);
    const pod_from = accounts.find((e) => e.id === pod?.account_id);
    const pod_fav = favs.find((e) => e.rp_id === pod?.id);
    const qp_fav = favs.find((e) => e.rp_id === qp.id);
    ret["type"] = v.type as Type;
    ret["qpPod"] = qp;
    ret["qpPod"]["favorited"] = qp_fav ? true : false;
    ret["qpPod"]["mypod"] = qp_from.id === account.id ? true : false;
    ret["qpPod"]["from"] = qp_from;
    if (pod) {
      // podは削除済み又は非公開で取得できないケースがある
      ret["qpPod"]["quote"] = pod;
      ret["qpPod"]["quote"]["favorited"] = pod_fav ? true : false;
      ret["qpPod"]["quote"]["mypod"] = pod_from.id === account.id ? true : false;
      ret["qpPod"]["quote"]["from"] = pod_from;
    }
    return ret as HomeTimeline;
  }

  private generateDp(
    v: TimelineCommonBase,
    pods: Pod[],
    dp_pods: DpPod[],
    accounts: Account[],
    account: Account,
    favs: { rp_id: string }[]
  ) {
    const ret = {};
    const dp = dp_pods.find((e) => e.id === v.id);
    const dp_from = accounts.find((e) => e.id === v.account_id);
    const pod = pods.find((e) => e.id === dp.rp_id);
    const pod_from = accounts.find((e) => e.id === pod?.account_id);
    const fav = favs.find((e) => e.rp_id === pod?.id);
    ret["type"] = v.type as Type;
    ret["dpPod"] = dp;
    ret["dpPod"]["from"] = dp_from;
    if (pod) {
      // podは削除済み又は非公開で取得できないケースがある
      ret["dpPod"]["body"] = pod;
      ret["dpPod"]["body"]["favorited"] = fav ? true : false;
      ret["dpPod"]["body"]["mypod"] = pod_from.id === account.id ? true : false;
      ret["dpPod"]["body"]["from"] = pod_from;
    }
    return ret as HomeTimeline;
  }

  private generatePod(
    v: TimelineCommonBase,
    pods: Pod[],
    accounts: Account[],
    account: Account,
    favs: { rp_id: string }[]
  ) {
    const ret = {};
    const pod = pods.find((e) => e.id === v.id);
    const pod_from = accounts.find((e) => e.id === pod.account_id);
    const fav = favs.find((e) => e.rp_id === pod.id);
    ret["type"] = v.type as Type;
    ret["pod"] = pod;
    ret["pod"]["favorited"] = fav ? true : false;
    ret["pod"]["mypod"] = pod_from.id === account.id ? true : false;
    ret["pod"]["from"] = pod_from;
    return ret as HomeTimeline;
  }

  private convertToResult(
    timeline: TimelineCommonBase[],
    pods: Pod[],
    dp_pods: DpPod[],
    qp_pods: QpPod[],
    accounts: Account[],
    account: Account,
    favs: { rp_id: string }[]
  ) {
    const result: HomeTimeline[] = timeline.map((v) => {
      switch (v.type) {
        case "qp":
          return this.generateQp(v, pods, qp_pods, accounts, account, favs);
        case "dp":
          return this.generateDp(v, pods, dp_pods, accounts, account, favs);
        case "pod":
          return this.generatePod(v, pods, accounts, account, favs);
      }
    }) as HomeTimeline[];
    return result;
  }

  async build(account: Account): Promise<HomeTimeline[]> {
    const starttime = performance.now();

    // 対象者のpodとdpとqpのidリストを取得
    const timeline = await this.getTimelineCommonBase(account);

    // 取得すべきtlがないなら早々に探索打ち切る
    if (timeline.length === 0) {
      return [];
    }

    // dpとqpを取得する
    const [dp_pods, qp_pods] = await Promise.all([
      this.getDpPods(timeline),
      this.getQpPods(timeline)
    ]);

    // podとfavしてるかを取得する
    const { pods, favs } = await this.getPodsAndFavs(timeline, dp_pods, qp_pods, account);

    // accountを取得する
    const accounts = await this.getAccounts(timeline, pods);

    // 結果をとりまとめてHomeTimeline[]に変換する
    const result = this.convertToResult(timeline, pods, dp_pods, qp_pods, accounts, account, favs);

    const endtime = performance.now();
    if (process.env.BONDUC_ENV === "local") {
      console.log("getHTL elapsed: ", endtime - starttime);
    }

    return result;
  }
}
