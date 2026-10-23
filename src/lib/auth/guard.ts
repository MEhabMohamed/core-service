import { NextFunction, Request, Response } from "express";
import { NotAuthinticated } from "../errors";
import { verfiyAccessToken } from "../../app/auth/utils";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.access_token;
    if (!token) {
        throw NotAuthinticated;
    }

    req.user = verfiyAccessToken(token);
    next();
}