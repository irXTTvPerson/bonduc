import { UnauthorizedException } from "@nestjs/common";
import { DBService } from "../db/db.service";
import { Account } from "@prisma/client";

export const validate = async (req: any, dbService: DBService) => {
  const token = req.signedCookies["session"];
  if (!token) {
    console.error("cookie: session not found ", new Date(), req.ip, req.headers, req.body);
    throw new UnauthorizedException();
  }

  const account = await dbService.redis.get(`session/${token}`);
  if (!account) {
    console.error("account validate failed ", new Date(), req.ip, req.headers, req.body);
    throw new UnauthorizedException();
  }

  const a: Account = JSON.parse(account);
  if (a) {
    console.log("validate success ", new Date(), req.ip, a, req.headers, req.body);
  }
  return a;
};

export const deleteUnrevealedBody = (pod: any, showOriginalBodyOfPartial: boolean) => {
  switch (pod.pod_type) {
    default: // pod
    case "quote":
    case "reply":
      break;

    case "duplicate":
      if (pod.body.body) delete pod.body.body;
      break;

    case "encrypted":
      // パスワード情報を消す
      if (pod.body.password_info) delete pod.body.password_info;
      if (pod.read_more) delete pod.body.additional_password_info;
      break;

    case "partial":
      if (showOriginalBodyOfPartial) {
        if (pod.body.unprintable_body) {
          // 伏せ字側を消して本文を見せる
          delete pod.body.unprintable_body;
          // 伏せ字の続きを読むがあればそれも消す
          if (pod.read_more) {
            delete pod.body.unprintable_additional_body;
          }
        }
      } else {
        // 本文を消して伏せ字側を見せる
        delete pod.body.body;
        // 本文の続きを読むがあればそれも消す
        if (pod.read_more) {
          delete pod.body.additional_body;
        }
      }

      break;
  }

  return pod;
}

export const deleteUnrevealedAccount = (account: Account) => {
  delete account.id;
  delete account.email;
  delete account.password;
  delete account.ip_address;
  return account;
}