import { Response } from "express";
import { PaginationMeta } from "./pagination/cursor-pagination";

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
    res: Response,
    data: T,
    statusCode = httpStatus.OK,
    meta?: Record<string, unknown>
) {
    const body: ApiResponse<T> = {
        success: true,
        data,
    };
    if (meta) {
        body.meta = meta;
    }
    res.status(statusCode).json(body);
}

export function sendPaginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta
) {
    res.status(httpStatus.OK).json({
        success: true,
        data,
        meta
    });
}

export const httpStatus = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202
};