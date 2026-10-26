import { NextFunction, Request, Response } from "express";
import { container } from "../di/container";
import { Tokens } from "../di/tokens";
import { toSec } from "../../pkg/utils/times";
import { ICacheProvider } from "../../pkg/cache/cache.interface";

interface IdempotencyOptions {
    strict?: boolean;
}

export function idempotency(options: IdempotencyOptions = {}) {
    const { strict = false } = options;
    return async function (req: Request, res: Response, next: NextFunction) {
        if (!["POST", "PATCH", "PUT"].includes(req.method)) {
            return next();
        }

        const idempotencyKey = req.header("Idempotency-Key");
        if (!idempotencyKey) {
            if (strict) {
                return res.status(400).json({
                    error: "Missing Idempotency-Key header",
                });
            }
            return next();
        }
        try {
            const cacheProvider: ICacheProvider = container.resolve(Tokens.CacheProvider);
            const key = `${req.method}:${req.originalUrl}:${idempotencyKey}`;
            const cached = await cacheProvider.get(key);
            if (cached) {
                return res.status(200).json(JSON.parse(cached));
            }
            const originalJson = res.json.bind(res)
            res.json = function (body: any) {
                cacheProvider.set(key, JSON.stringify(body), toSec.day(1));
                return originalJson(body);
            }
            next();
        } catch (error) {
            if (strict) {
                return res.status(503).json({
                    error: "Idempotency service unavailable",
                });
            }
            next();
        }
    }
}