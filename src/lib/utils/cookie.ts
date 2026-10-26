import { Response } from "express";
import { env } from "../config/env";
import { toMs } from "../../pkg/utils/times";

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        maxAge: toMs.hour(1)
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: env.nodeEnv === "production",
        maxAge: toMs.day(7),
        path: "/api/auth/refresh"
    });
}