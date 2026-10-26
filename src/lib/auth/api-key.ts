import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AppError } from "../error/AppError";
import { httpStatus } from "../http/response";

export function requireInternalApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header("api-key");
    if (!apiKey || apiKey !== env.internal.apiKey) {
        throw new AppError("Invalid or missing internal API key", httpStatus.UNAUTHORIZED);
    }
    next();
}
