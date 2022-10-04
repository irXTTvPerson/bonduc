import { Config } from "../../../config";

export const subject = "bonduc 正規登録のお願い";

export const body = (token: string) => {
  return `${Config.feEndpoint}/register?token=${token}<br><br>にアクセスして登録を完了してください`;
};
