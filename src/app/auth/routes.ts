import { Router } from "express";
import { container } from "../../lib/di/container";
import { AuthController } from "./controller/auth.controller";
import { Tokens } from "../../lib/di/tokens";
import { idempotency } from "../../lib/idempotency/idempotency";

export const authRouter = Router();

const authController = container.resolve<AuthController>(Tokens.AuthController);

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forgot-password", idempotency({ strict: true }), authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/refresh", authController.refreshAccessToken);
authRouter.post("/accept-invite", authController.acceptInvite);