import { AppError } from "../../lib/error/AppError";

export const AddressNotCreatedError = new AppError("Address not created", 400);
export const AddressNotFoundError = new AppError("Address not found", 404);
export const AddressNotDeletedError = new AppError("Address not deleted", 400);
