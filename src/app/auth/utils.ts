import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../lib/config/env';
import crypto from 'crypto';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export interface jwtPayload {
    userId: number,
    email: string,
    role: string,
    restaurantId?: number,
    restaurantRole?: string,
    branchIds?: number[],
}

export function createAccessToken(payload: jwtPayload): string {
    const options: SignOptions = {
        expiresIn: Number(env.jwt.accessExpiresIn)
    }
    return jwt.sign(
        payload,
        env.jwt.accessSecret,
        options
    )
}

export function createRefreshToken(payload: jwtPayload): string {
    const options: SignOptions = {
        expiresIn: Number(env.jwt.refreshExpiresIn)
    }
    return jwt.sign(
        payload,
        env.jwt.refreshSecret,
        options
    )
}

export function verfiyAccessToken(token: string): jwtPayload {
    return jwt.verify(token, env.jwt.accessSecret) as jwtPayload;
}

export function verfiyRefreshToken(token: string): jwtPayload {
    return jwt.verify(token, env.jwt.refreshSecret) as jwtPayload;
}

export function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
}

export async function hashOTP(otp: string) {
    return crypto.createHash("sha256").update(otp).digest("hex");
}