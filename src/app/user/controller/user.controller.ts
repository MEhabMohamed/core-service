import { UserService } from "../service/user.service";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendSuccess } from "../../../lib/http/response";
import { validateBody } from "../../../lib/validation/validate";
import { UserUpdateDTO } from "../dto/user.dto";

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
            const data = await validateBody(UserUpdateDTO, req.body);
            const user = await this.userService.updateUserProfile(req.user?.userId!, data);
            sendSuccess(res, { message: "User profile updated successfully", data: user }, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    getInternalAgent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const agent = await this.userService.getAgentById(Number(req.params.id));
            sendSuccess(res, agent, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }
}
