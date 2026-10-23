import { AppError } from "../../lib/error/AppError";

export const RestaurantNotFoundError = new AppError("Restaurant not found", 404);
export const UnauthorizedError = new AppError("User not authorized", 403);
export const BranchNotFoundError = new AppError("Branch not found", 404);