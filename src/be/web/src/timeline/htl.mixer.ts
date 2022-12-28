import { Config } from "../config";
import { Account, Pod, DpPod, QpPod, QpContentType, DpContentType } from "@prisma/client";
import { HomeTimeline } from "./htl.model";
import { DBService } from "../db/db.service";

type PodType = "pod" | "dp" | "qp";

type TimelineCommonBase = {
  id: string;
  account_id: string;
  created_at: Date;
  rp_id: string | null;
  rp_type: QpContentType | DpContentType | null;
  type: PodType;
};

const defaultVisibility = `visibility in ('anyone'::"PodVisibility", 'login'::"PodVisibility", 'global'::"PodVisibility", 'local'::"PodVisibility", 'follower'::"PodVisibility", 'password'::"PodVisibility")`;

const query = (following_place_holder: string, limit: number) =>
  `select
  id, account_id, created_at, NULL as rp_id, NULL as rp_type, 'pod' as type
from
  "Pod" p 
where 
    (account_id in (${following_place_holder}))
  and
    (${defaultVisibility})
union all
  select
    id, account_id, created_at, rp_id, cast(rp_type as text), 'dp' as type
  from
    "DpPod" p 
  where 
      (account_id in (${following_place_holder}))
    and
      (${defaultVisibility})
union all
  select
    id, account_id, created_at, rp_id, cast(rp_type as text), 'qp' as type
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
        timeline.map((v) => (v.type === "dp" ? v.id : undefined)).filter((v) => v !== undefined)
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
      ...new Set([
        ...timeline.map((v) => (v.type === "qp" ? v.id : undefined)).filter((v) => v !== undefined),
        ...timeline
          .map((v) => (v?.rp_type === "qp" ? v?.rp_id : undefined))
          .filter((v) => v !== undefined)
      ])
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

  private async getPods(timeline: TimelineCommonBase[]) {
    const pod_list = [
      ...new Set([
        ...timeline
          .map((v) => (v.type === "pod" ? v.id : undefined))
          .filter((v) => v !== undefined),
        ...timeline
          .map((v) => (v?.rp_type === "pod" ? v?.rp_id : undefined))
          .filter((v) => v !== undefined)
      ])
    ];
    const pod_place_holder = this.gen_place_holder(pod_list.length);
    let pods: Pod[] = [];

    if (pod_list.length > 0) {
      pods = await this.dbSerVice.pool[2].$queryRawUnsafe(
        `select * from "Pod" p where id in (${pod_place_holder})`,
        ...pod_list
      );
    }
    return pods;
  }

  private async getFavs(timeline: TimelineCommonBase[], account: Account) {
    const pod_list = [
      ...new Set([
        ...timeline
          .map((v) => (v.type === "pod" || v.type === "qp" ? v.id : undefined))
          .filter((v) => v !== undefined),
        ...timeline
          .map((v) => (v?.rp_type === "pod" || v?.rp_type === "qp" ? v?.rp_id : undefined))
          .filter((v) => v !== undefined)
      ])
    ];

    const pod_place_holder = this.gen_place_holder(pod_list.length);
    let favs: { rp_id: string }[] = [];

    if (pod_list.length > 0) {
      favs = await this.dbSerVice.pool[3].$queryRawUnsafe(
        `select rp_id from "Favorite" f where rp_id in (${pod_place_holder}) and account_id='${account.id}'`,
        ...pod_list
      );
    }
    return favs;
  }

  private async getAccounts(timeline: TimelineCommonBase[], pods: Pod[], qp: QpPod[]) {
    const account_list = [
      ...new Set([
        ...timeline.map((v) => v.account_id),
        ...pods.map((v) => v.account_id),
        ...qp.map((v) => v.account_id)
      ])
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
    const qp_fav = favs.find((e) => e.rp_id === qp.id);
    const pod = pods.find((e) => e.id === qp.rp_id);
    const pod_from = accounts.find((e) => e.id === pod?.account_id);
    const qp_pod = qp_pods.find((e) => e.id === qp.rp_id);
    const qp_pod_from = accounts.find((e) => e.id === qp_pod?.account_id);
    ret["qp"] = qp;
    ret["qp"]["favorited"] = qp_fav ? true : false;
    ret["qp"]["mypod"] = qp_from.id === account.id ? true : false;
    ret["qp"]["from"] = qp_from;
    ret["qp"]["type"] = (pod ? "pod" : "qp") as QpContentType;
    if (pod) {
      // podは削除済み又は非公開で取得できないケースがある
      const fav = favs.find((e) => e.rp_id === pod.id);
      ret["qp"]["pod"] = pod;
      ret["qp"]["pod"]["favorited"] = fav ? true : false;
      ret["qp"]["pod"]["mypod"] = pod_from.id === account.id ? true : false;
      ret["qp"]["pod"]["from"] = pod_from;
    }
    if (qp_pod) {
      const fav = favs.find((e) => e.rp_id === qp_pod.id);
      ret["qp"]["qp"] = qp_pod;
      ret["qp"]["qp"]["favorited"] = fav ? true : false;
      ret["qp"]["qp"]["mypod"] = qp_pod_from.id === account.id ? true : false;
      ret["qp"]["qp"]["from"] = qp_pod_from;
    }
    return ret as HomeTimeline;
  }

  private generateDp(
    v: TimelineCommonBase,
    pods: Pod[],
    dp_pods: DpPod[],
    qp_pods: QpPod[],
    accounts: Account[],
    account: Account,
    favs: { rp_id: string }[]
  ) {
    const ret = {};
    const dp = dp_pods.find((e) => e.id === v.id);
    const dp_from = accounts.find((e) => e.id === v.account_id);
    const pod = pods.find((e) => e.id === dp.rp_id);
    const pod_from = accounts.find((e) => e.id === pod?.account_id);
    const qp_pod = qp_pods.find((e) => e.id === dp.rp_id);
    const qp_pod_from = accounts.find((e) => e.id === qp_pod?.account_id);
    ret["dp"] = dp;
    ret["dp"]["from"] = dp_from;
    ret["dp"]["type"] = (pod ? "pod" : "qp") as DpContentType;
    if (pod) {
      // podは削除済み又は非公開で取得できないケースがある
      const fav = favs.find((e) => e.rp_id === pod.id);
      ret["dp"]["pod"] = pod;
      ret["dp"]["pod"]["favorited"] = fav ? true : false;
      ret["dp"]["pod"]["mypod"] = pod_from.id === account.id ? true : false;
      ret["dp"]["pod"]["from"] = pod_from;
    }
    if (qp_pod) {
      const fav = favs.find((e) => e.rp_id === qp_pod.id);
      ret["dp"]["qp"] = qp_pod;
      ret["dp"]["qp"]["favorited"] = fav ? true : false;
      ret["dp"]["qp"]["mypod"] = qp_pod_from.id === account.id ? true : false;
      ret["dp"]["qp"]["from"] = qp_pod_from;
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
          return this.generateDp(v, pods, dp_pods, qp_pods, accounts, account, favs);
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

    // pod, dp, qp, fav を取得する
    const [dp_pods, qp_pods, pods, favs] = await Promise.all([
      this.getDpPods(timeline),
      this.getQpPods(timeline),
      this.getPods(timeline),
      this.getFavs(timeline, account)
    ]);

    // accountを取得する
    const accounts = await this.getAccounts(timeline, pods, qp_pods);

    // 結果をとりまとめてHomeTimeline[]に変換する
    const result = this.convertToResult(timeline, pods, dp_pods, qp_pods, accounts, account, favs);

    const endtime = performance.now();
    if (process.env.BONDUC_ENV === "local") {
      console.log("getHTL elapsed: ", endtime - starttime);
    }

    return result;
  }
}
