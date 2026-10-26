import { UserService } from "../service/user.service";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendSuccess } from "../../../lib/http/response";

@injectable()
export class UserController {
    constructor(@inject(Tokens.UserService)
    private readonly userService: UserService) { }

    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.getByUserId(req.user?.userId!);
            sendSuccess(res, user, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userService.updateUserProfile(req.user?.userId!, req.body);
            sendSuccess(res, { message: "User profile updated successfully", data: user }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    getInternalAgent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await this.userService.getByUserId(Number(req.params.id));
            if (!agent) {
                res.status(httpStatus.NOT_FOUND).json({ message: "Agent not found" });
                return;
            }
            sendSuccess(res, {
                id: agent.id,
                name: agent.name,
                phone: agent.phone
            }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }
}
