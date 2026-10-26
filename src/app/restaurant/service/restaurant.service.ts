import { Knex } from "knex";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import {
    createRestaurant,
    findAllRestaurants,
    findRestaurantById,
    updateRestaurant,
    updateRestaurantStatus
} from "../repository/restaurant.repo";
import { CreateRestaurantDTO, UpdateRestaurantDTO, updateRestaurantStatusDTO } from "../dto/restaurant.dto";
import { findUserExistsByEmailOrPhone } from "../../user/repository/user.repo";
import { UserAlreadyExistError } from "../../auth/errors";
import { createAccessToken, createRefreshToken } from "../../auth/utils";
import { db } from "../../../lib/knex/knex";
import { SystemRole } from "../../user/enums";
import { inject, injectable } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { UserService } from "../../user/service/user.service";
import { buildPaginationLimit, FilterParams, PaginationParams } from "../../../lib/http/pagination/cursor-pagination";
import { OwnerAlreadyExistsError, RestaurantNotFoundError } from "../errors";
import { UnAuthorisedError } from "../../../lib/auth/errors";
import { insertOutboxEvent } from "../../../lib/events/outbox.repo";
import { EVENT_TYPES } from "../../../lib/events/event-types";

@injectable()
export class RestaurantService {

    constructor(@inject(Tokens.UserService) private readonly userService: UserService) { }

    create = async (userId: number, data: CreateRestaurantDTO, trx: Knex) => {
        const now = new Date();
        const restaurant = await createRestaurant(new Restaurant({
            ownerId: userId,
            name: data.name,
            logoURL: data.logoUrl,
            status: RestaurantStatus.PENDING,
            primaryCountry: data.primaryCountry,
            createdAt: now,
            updatedAt: now,
            statusUpdatedAt: now
        }), trx);
        return restaurant;
    }

    createWithOwner = async (role: SystemRole, data: CreateRestaurantDTO) => {
        if (role !== SystemRole.SYSTEM_ADMIN) {
            throw UnAuthorisedError
        }

        const existing = await findUserExistsByEmailOrPhone(data.owner.email, data.owner.phone);

        if (existing) throw OwnerAlreadyExistsError;

        const now = new Date();
        const trx = await db.transaction();
        let user;
        let restaurant;

        try {
            user = await this.userService.create({
                name: data.owner.name,
                email: data.owner.email,
                phone: data.owner.phone,
                password: data.owner.password,
                systemRole: SystemRole.RESTAURANT_USER
            })

            restaurant = await createRestaurant(new Restaurant({
                ownerId: user.id,
                name: data.name,
                logoURL: data.logoUrl ?? "",
                status: RestaurantStatus.ACTIVE,
                primaryCountry: data.primaryCountry,
                createdAt: now,
                updatedAt: now,
                statusUpdatedAt: now
            }), trx);

            const { container: c } = require("../../../lib/di/container");
            const { Tokens: T } = require("../../../lib/di/tokens");
            const memberSvc = c.resolve(T.MemberService);
            await memberSvc.createOwnerMember(user.id, restaurant.id, trx);

            await trx.commit();
        }
        catch (e) { await trx.rollback(); throw e; }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole
        }

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        return {
            message: "Restaurant added successfully",
            accessToken, refreshToken, user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                systemRole: user.systemRole,
                createdAt: user.createdAt
            },
            restaurant
        }
    }

    findAll = async (params: PaginationParams, filters: FilterParams[]) => {
        const result = await findAllRestaurants(params, filters);
        return buildPaginationLimit(result, params.limit, params.sortBy);
    }

    findRestaurantById = async (id: number) => {
        const result = await findRestaurantById(id);

        if (!result) {
            throw RestaurantNotFoundError
        };

        return result;
    }

    update = async (id: number, userId: number, data: UpdateRestaurantDTO, role: SystemRole) => {
        const restaurant = await this.findRestaurantById(id);
        if (!restaurant) throw RestaurantNotFoundError;

        if (role !== SystemRole.SYSTEM_ADMIN && Number(userId) !== Number(restaurant.ownerId)) {
            throw UnAuthorisedError
        }
        return await updateRestaurant(id, data);
    }

    updateStatus = async (id: number, data: updateRestaurantStatusDTO, role: SystemRole) => {
        if (role !== SystemRole.SYSTEM_ADMIN) {
            throw UnAuthorisedError;
        }

        const restaurant = await this.findRestaurantById(id);
        if (!restaurant) throw RestaurantNotFoundError;

        const trx = await db.transaction();
        try {
            const updated = await updateRestaurantStatus(id, data.status, trx);
            if (data.status === "suspended") {
                await insertOutboxEvent(trx, {
                    aggregateType: "restaurants",
                    aggregateId: id,
                    eventType: EVENT_TYPES.RESTAURANT_SUSPENDED,
                    payload: { restaurantId: id },
                });
            }
            await trx.commit();
            return updated;
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    }
}