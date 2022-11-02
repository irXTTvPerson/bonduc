import { createClient } from "redis";
import { Config } from "../config";

export const redis = createClient({
  url: Config.redis.url
});
redis.on("error", (err) => console.error("Redis Client Error", err));
redis
  .connect()
  .then(() => console.log("redis connected"))
  .catch((e) => console.error(e));
