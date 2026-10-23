import { Response, Request, NextFunction } from "express";
import { MemberService } from "../service/member.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateMemberDTO, UpdateMemberBranchesDTO, UpdateMemberDTO } from "../dto/member.dto";
import { inject, injectable } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendSuccess } from "../../../lib/http/response";

@injectable()
export class MemberController {
    constructor(@inject(Tokens.MemberService) private readonly memberService: MemberService) { }

    createMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateMemberDTO, req.body)
            const messageId = await this.memberService.createMember(Number(req.params.restaurantId), data)
            sendSuccess(res,
                { message: "Invitation email sent successfully", messageId },
                httpStatus.CREATED
            );
        } catch (error) {
            next(error)
        }
    }

    listMembers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.memberService.listMembers(Number(req.params.restaurantId))
            sendSuccess(res,
                { message: "Members listed successfully", data: result },
                httpStatus.OK
            );
        } catch (error) {
            next(error)
        }
    }

    updateMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateMemberDTO, req.body)
            await this.memberService.updateMember(Number(req.params.memberId), Number(req.params.restaurantId), data)
            sendSuccess(res,
                { message: "Member updated successfully" },
                httpStatus.OK
            );
        } catch (error) {
            next(error)
        }
    }

    deleteMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.memberService.deleteMember(Number(req.params.memberId), Number(req.params.restaurantId))
            sendSuccess(res,
                { message: "Member deleted successfully" },
                httpStatus.OK
            );
        } catch (error) {
            next(error)
        }
    }

    updateMemberBranches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateMemberBranchesDTO, req.body)
            await this.memberService.updateMemberBranches(Number(req.params.memberId), Number(req.params.restaurantId), data)
            sendSuccess(res,
                { message: "Member branches updated successfully" },
                httpStatus.OK
            );
        } catch (error) {
            next(error)
        }
    }

    getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.memberService.getRolePermissions(req.params.role as string)
            sendSuccess(res, result, httpStatus.OK)
        } catch (error) {
            next(error)
        }
    }
}