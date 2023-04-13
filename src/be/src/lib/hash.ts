import { createHash } from "crypto";

export const hash = (arg: string) => {
  const hash = createHash("sha3-512");
  return hash.update(arg).digest("hex");
};
