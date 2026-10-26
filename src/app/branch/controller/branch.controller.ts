import { NextFunction, Request, Response } from "express";
import { BranchService } from "../service/branch.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateBranchDTO, UpdateBranchDTO } from "../dto/branch.dto";
import { SystemRole } from "../../user/enums";
import { injectable, inject } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendSuccess } from "../../../lib/http/response";

@injectable()
export class BranchController {
    constructor(
        @inject(Tokens.BranchService)
        private readonly branchService: BranchService
    ) { }

    createBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateBranchDTO, req.body);
            const branch = await this.branchService.createBranch(data, req.user?.userId!, Number(req.params.restaurantId), req.user?.role as SystemRole)
            sendSuccess(res, { message: 'Branch created successfully', data: branch }, httpStatus.CREATED)
        } catch (error) {
            next(error)
        }
    }

    findNearByBranches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branches = await this.branchService.findNearByBranches(Number(req.query.lat), Number(req.query.lng))
            sendSuccess(res, branches, httpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

    findByRestaurantId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branches = await this.branchService.findByRestaurantId(Number(req.params.restaurantId))
            sendSuccess(res, branches, httpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateBranchDTO, req.body);
            const branch = await this.branchService.update(Number(req.params.branchId), data, req.user?.role as SystemRole, req.user?.userId!);
            sendSuccess(res, { message: 'Branch updated successfully', data: branch }, httpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branch = await this.branchService.updateStatus(Number(req.params.branchId), req.body.commission, req.body.isActive, req.user?.role as SystemRole)
            sendSuccess(res, { message: 'Branch status updated successfully', data: branch }, httpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

    getInternalBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branch = await this.branchService.getInternalBranch(Number(req.params.id));
            sendSuccess(res, branch, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }

    getInternalBranches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const raw = typeof req.query.ids === "string" ? req.query.ids : "";
            const ids = raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0);
            const branches = await this.branchService.getInternalBranches(ids);
            sendSuccess(res, branches, httpStatus.OK);
        } catch (error) {
            next(error);
        }
    }
}

