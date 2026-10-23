import { NextFunction, Request, Response } from "express";
import { RestaurantService } from "../service/restaurant.service";
import { CreateRestaurantDTO, UpdateRestaurantDTO, updateRestaurantStatusDTO } from "../dto/restaurant.dto";
import { validateBody } from "../../../lib/validation/validate";
import { SystemRole } from "../../user/enums";
import { RestaurantStatus } from "../enums";
import { inject, injectable } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { httpStatus, sendPaginated, sendSuccess } from "../../../lib/http/response";
import { setAuthCookies } from "../../../lib/utils/cookie";
import { parseFilterQuery, parsePaginationQuery } from "../../../lib/http/pagination/parse-query";

@injectable()
export class RestaurantController {
    constructor(@inject(Tokens.RestaurantService)
    private readonly restaurantService: RestaurantService) { }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateRestaurantDTO, req.body);
            const result = await this.restaurantService.createWithOwner(req.user?.role as SystemRole, data);
            setAuthCookies(res, result.accessToken, result.refreshToken);
            return sendSuccess(res, { message: "Restaurant created successfully", data: result }, httpStatus.CREATED);
        } catch (error) {
            next(error)
        }
    }

    findAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = parsePaginationQuery(req.query, ["status", "name", "createdAt"]);
            const filters = parseFilterQuery(req.query, ["status", "name", "id"]);
            const result = await this.restaurantService.findAll(params, filters);
            sendPaginated(res, result.data, result.meta);
        } catch (error) {
            next(error)
        }
    }

    findRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const result = await this.restaurantService.findRestaurantById(id);
            sendSuccess(res, result, httpStatus.OK);
        } catch (error) {
            next(error)
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateRestaurantDTO, req.body);
            const result = await this.restaurantService.update(Number(req.params.id), Number(req.user?.userId), data, req.user?.role as SystemRole);
            sendSuccess(res, { message: "Restaurant updated successfully", data: result }, httpStatus.OK);
        } catch (error) {
            next(error)
        }
    }

    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const data = await validateBody(updateRestaurantStatusDTO, req.body);
            const result = await this.restaurantService.updateStatus(id, data, req.user?.role as SystemRole);
            sendSuccess(res, { message: "Restaurant status updated successfully", data: result }, httpStatus.OK);
        } catch (error) {
            next(error)
        }
    }
}