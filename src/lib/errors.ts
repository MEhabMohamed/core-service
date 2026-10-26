import { AppError } from "./error/AppError";

export const NotAuthenticated = new AppError("User not authenticated", 401);
export const NotAuthinticated = NotAuthenticated;