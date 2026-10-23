import { AppError } from "./error/AppError";

export const NotAuthinticated = new AppError("User not authenticated", 403);