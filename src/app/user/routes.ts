import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { Tokens } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";
import { UserController } from "./controller/user.controller";

export const userRouter = Router();

const userController = container.resolve<UserController>(Tokens.UserController);

userRouter.get("/me", authenticate, userController.getMe);
userRouter.patch("/me", authenticate, userController.updateUserProfile);