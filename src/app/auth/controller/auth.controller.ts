import { NextFunction, Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { validateBody } from "../../../lib/validation/validate";
import { ForgotPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { days, hours } from "../../../pkg/utils/times.utils";
import { env } from "../../../lib/config/env";
import { NoRefreshTokenFound } from "../errors";
import { inject, injectable } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendSuccess } from "../../../lib/http/response";
import { setAuthCookies } from "../../../lib/utils/cookie";

@injectable()
export class AuthController {
    constructor(@inject(Tokens.AuthService) private readonly authService: AuthService) { }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(RegisterDTO, req.body);
            const result = await this.authService.register(data);
            setAuthCookies(res, result.accessToken, result.refreshToken);
            return sendSuccess(res, { message: "User registered successfully", data: result }, httpStatus.CREATED);
        } catch (error) {
            next(error);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(LoginDTO, req.body);
            const result = await this.authService.login(data);
            setAuthCookies(res, result.accessToken, result.refreshToken);
            return sendSuccess(res, { message: "User logged in successfully", data: result }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(ForgotPasswordDTO, req.body);
            await this.authService.forgotPassword(data);
            return sendSuccess(res,
                { message: "Email sent with otp" },
                httpStatus.OK
            );
        } catch (error) {
            next(error);
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.resetPassword(data);
            return sendSuccess(res, { message: "Password reset successfully, please login again!" }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.acceptInvite(data);
            return sendSuccess(res, { message: "Invitation accepted successfully, please login again" }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refresh_token;
            if (!refreshToken) {
                throw NoRefreshTokenFound;
            }
            const result = await this.authService.refreshAccessToken(refreshToken);
            res.cookie("access_token", result.accessToken, {
                httpOnly: true,
                secure: env.nodeEnv === "production",
                maxAge: hours(1)
            });
            return sendSuccess(res, { message: "Access token refreshed successfully", data: result }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }
}