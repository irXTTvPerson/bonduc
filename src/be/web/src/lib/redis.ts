import { createClient, RedisClientType } from "redis";
import { Config } from "../config";

export let redis = null;

(async () => {
  try {
    const client = createClient({
      url: Config.redis.url
    });
    client.on("error", (err) => console.error("Redis Client Error", err));
    await client.connect();
    redis = client;
    console.log('redis connected');
  } catch (e) {
    console.error(e);
  }
})();