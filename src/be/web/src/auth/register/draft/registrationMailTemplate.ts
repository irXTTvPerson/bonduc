export const subject = "bonduc 正規登録のお願い";

export const body = (token: string) => {
  return `${process.env.NEXT_PUBLIC_FE_WEB_URL}/auth/register?token=${token}<br><br>にアクセスして登録を完了してください`;
};
