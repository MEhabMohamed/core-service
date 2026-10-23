import { AppError } from "../../lib/error/AppError";

export const UserAlreadyExistError = new AppError("User already exists with the same phone or email", 400)
export const CannotSignUpAsSystemAdmin = new AppError("You cannot register as a system admin", 403)
export const IncorrectCredentials = new AppError("Incorrect Email or Password", 401)
export const InvalidOrExpiredOTP = new AppError("Invalid or expired OTP", 401)
export const NoRefreshTokenFound = new AppError("No refresh token found", 404)
export const RestaurantDataRequiredError = new AppError("Restaurant data is required", 400)