import { Logger, Injectable } from "@nestjs/common";
import { validate, deleteUnrevealedBody, deleteUnrevealedAccount } from "../lib/validate";
import { DBService } from "../db/db.service";

@Injectable()
export class ATLService {
  private readonly logger = new Logger("ATLService");

  constructor(private readonly dbService: DBService) { }

  private async getPublicPods(identifier_name: string) {
    let [pod, account] = await Promise.all([
      this.dbService.pool[0].pod.findMany({
        where: {
          AND: {
            account: {
              identifier_name: identifier_name
            },
            visibility: "anyone"
          }
        },
        take: 20,
        orderBy: { created_at: "desc" },
        include: {
          account: {
            select: {
              identifier_name: true,
              screen_name: true,
              icon_uri: true,
            }
          }
        }
      }),
      this.dbService.pool[1].account.findUnique({
        where: { identifier_name: identifier_name }
      })
    ]);
    // publicアクセス可能なpodは伏せ字見れないのがデフォルト
    pod = pod.map(e => deleteUnrevealedBody(e, false));
    account = deleteUnrevealedAccount(account);
    return { account: account, pods: pod };
  }

  private async getPrivatePods(identifier_name: string) {
    let [pod, account] = await Promise.all([
      this.dbService.pool[0].pod.findMany({
        where: {
          account: {
            identifier_name: identifier_name
          }
        },
        take: 20,
        orderBy: { created_at: "desc" },
        include: {
          account: {
            select: {
              identifier_name: true,
              screen_name: true,
              icon_uri: true,
            }
          }
        }
      }),
      this.dbService.pool[1].account.findUnique({
        where: { identifier_name: identifier_name }
      })
    ]);
    // TODO
    // フォロワーだったら第二引数をtrueにして伏せ字見れるようにする
    pod = pod.map(e => deleteUnrevealedBody(e, false));
    account = deleteUnrevealedAccount(account);
    return { account: account, pods: pod };
  }

  async get(req: any, identifier_name: string) {
    const token = req.signedCookies["session"];
    try {
      if (token) {
        await validate(req, this.dbService);
        this.logger.log("valid token");
        return await this.getPrivatePods(identifier_name);
      } else {
        this.logger.log("no token");
        return await this.getPublicPods(identifier_name);
      }
    } catch (e) {
      this.logger.error(e);
      return null;
    }
  }

}
