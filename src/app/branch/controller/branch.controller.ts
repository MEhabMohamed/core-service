import { NextFunction, Request, Response } from "express";
import { BranchService } from "../service/branch.service";
import { validateBody } from "../../../lib/validation/validate";
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../dto/branch.dto";
import { SystemRole } from "../../user/enums";
import { injectable, inject } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendSuccess } from "../../../lib/http/response";
import { BranchNotFoundError } from "../errors";

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
            const data = await validateBody(UpdateBranchStatusDTO, req.body);
            const branch = await this.branchService.updateStatus(Number(req.params.branchId), data, req.user?.role as SystemRole)
            sendSuccess(res, { message: 'Branch status updated successfully', data: branch }, httpStatus.OK)
        } catch (error) {
            next(error)
        }
    }

    findByIdWithRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const result = await this.branchService.findByIdWithRestaurant(id);
            if (!result) throw BranchNotFoundError;
            sendSuccess(res, toInternalBranchDTO(result));
        } catch (err) {
            next(err);
        }
    }

    /**
     * Batch lookup for the order-service's `getBranchesByIds`. Caller passes
     * `?ids=1,2,3` (max 100 per call to keep the URL bounded). Missing ids
     * are silently dropped from the response — clients should not assume
     * `response.length === input.length`.
     */
    findByIdsWithRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const raw = String(req.query.ids ?? "").trim();
            if (!raw) return sendSuccess(res, []);
            const ids = raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
            if (ids.length === 0) return sendSuccess(res, []);
            if (ids.length > 100) return res.status(400).json({ error: "ids: max 100 per call" });
            const results = await this.branchService.findByIdsWithRestaurant(ids);
            sendSuccess(res, results.map(toInternalBranchDTO));
        } catch (err) {
            next(err);
        }
    }
}

function toInternalBranchDTO(r: { branch: any; restaurantStatus: string; restaurantOwnerId: number }) {
    const { branch, restaurantStatus, restaurantOwnerId } = r;
    return {
        id: branch.id,
        restaurantId: branch.restaurantId,
        restaurantOwnerId,
        restaurantStatus,
        region: branch.countryCode,
        isActive: branch.isActive,
        acceptOrders: branch.acceptOrders,
        deliveryFee: branch.deliveryFee,
        // restaurant_branches.commission is stored as a 0-100 percent (the
        // UpdateBranchStatusDTO caps it at 100). Convert to basis points here
        // so consumers can use the standard bps math (× / 10000).
        commissionBps: branch.commission * 100,
        currency: branch.currency,
        lat: Number(branch.lat),
        lng: Number(branch.lng),
        name: branch.label,
        addressText: branch.addressText,
    };
}