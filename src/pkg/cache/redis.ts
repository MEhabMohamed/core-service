import Redis from "ioredis";
import { ICacheProvider } from "./cache.interface";

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
}

export class RedisCacheProvider implements ICacheProvider {
    private readonly client: Redis;

    constructor(private readonly config: RedisConfig) {
        this.client = new Redis({
            host: config.host,
            port: config.port,
            password: config.password,
            lazyConnect: true,
            maxRetriesPerRequest: 3
        })

        this.client.on("error", (err) => {
            console.error("redis error", err);
        })

        this.client.connect().catch((err) => {
            console.error("redis connect error", err);
        });
    }

    async get(key: string): Promise<any> {
        return this.client.get(key)
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<any> {
        if (ttlSeconds) {
            return this.client.set(key, value, "EX", ttlSeconds)
        }
        return this.client.set(key, value)
    }

    async del(key: string): Promise<any> {
        return this.client.del(key)
    }

}