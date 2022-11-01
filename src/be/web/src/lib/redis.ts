import { createClient } from 'redis';
import { Config } from '../config';

export const client = async () => {
  try {
    const client = createClient({
      url: Config.redis.url
    });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
    return client;
  } catch (e) {
    console.error(e);
  }
}
