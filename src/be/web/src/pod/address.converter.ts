import { Account, PodVisibility } from "@prisma/client";

export const convertVisibilityTo = (visibility: PodVisibility, account: Account) => {
  let to = [];
  switch (visibility) {
    default:
    case "login":
      to = ["https://www.w3.org/ns/activitystreams#Local"];
      break;
    case "anyone":
      to = ["https://www.w3.org/ns/activitystreams#Public"];
      break;
    case "myself":
      to = [account.account_unique_uri];
      break;
    case "following":
      to = [account.following_uri];
      break;
    case "follower":
      to = [account.follower_uri];
      break;
    case "mutual":
      // TODO
      // to = [...mutual_accounts_uri];
      break;
    case "list":
      // TODO
      // to = [...listed_accounts_uri];
      break;
    case "mention":
      // TODO
      // to = [...mentioned_accounts_uri];
      break;
  }
  return to;
};

export const convertVisibilityCc = (visibility: PodVisibility, account: Account) => {
  let cc = [];
  switch (visibility) {
    case "login":
    case "anyone":
    case "mention":
      cc = [account.follower_uri];
      break;
    default:
      break;
  }
  return cc;
};
