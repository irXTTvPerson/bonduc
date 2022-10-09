import { createHash } from "crypto";
import { Config } from "../config";
import { BinaryToTextEncoding } from "crypto";

export const hash = (arg: string) => {
  const hash = createHash(Config.crypto.hashAlgo);
  return hash.update(arg).digest(Config.crypto.encoding as BinaryToTextEncoding);
};
