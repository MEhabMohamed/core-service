import { NextFunction, Request, Response } from "express";
import { container } from "../di/container";
import { Tokens } from "../di/tokens";
import { ICacheProvider } from "../../pkg/cache/cache.interface";
import { toSec } from "../../pkg/utils/times";

export function withCache(ttl: number = toSec.hour(1), userScoped: boolean = false) {
    return async function (req: Request, res: Response, next: NextFunction) {
        try {
            const cacheProvider: ICacheProvider = container.resolve(Tokens.CacheProvider);
            let key = `${req.method}:${req.originalUrl}`;

            if (userScoped) {
                key = `${key}:${req.user?.userId}`;
            }

            const cached = await cacheProvider.get(key);

            if (cached) {
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).json(JSON.parse(cached));
            }

            const originalJson = res.json.bind(res)
            res.json = function (body: any) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cacheProvider.set(key, JSON.stringify(body), ttl);
                }
                res.setHeader('X-Cache', 'MISS');
                return originalJson(body);
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}