import { findRestaurantById, findRestaurantsByIds } from "../../restaurant/repository/restaurant.repo";
import { SystemRole } from "../../user/enums";
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../dto/branch.dto";
import { Branch } from "../entity/branch.entity";
import { BranchNotFoundError } from "../errors";
import {
    createBranch,
    findBranchById,
    findByRestaurantId,
    findNearByBranches,
    updateBranch,
    updateBranchStatus,
    findBranchesByIds
} from "../repository/branch.repo";
import { injectable } from "tsyringe";

import { db } from "../../../lib/knex/knex";
import { insertOutboxEvent } from "../../../lib/events/outbox.repo";
import { EVENT_TYPES } from "../../../lib/events/event-types";
import { RestaurantNotFoundError } from "../../restaurant/errors";
import { UnAuthorisedError } from "../../../lib/auth/errors";
import { BranchWithRestaurant } from "../types";
import { cacheProvider } from "../../../lib/cache/init";

@injectable()
export class BranchService {
    findNearByBranches = async (lat: number, lng: number) => {
        const rows = await findNearByBranches(lat, lng);
        return rows;
    }

    createBranch = async (data: CreateBranchDTO, userId: number, restaurantId: number, userRole: SystemRole) => {
        const restaurant = await findRestaurantById(restaurantId);

        if (!restaurant) {
            throw RestaurantNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }

        const now = new Date();
        const branch = await createBranch(new Branch({
            restaurantId: restaurantId,
            countryCode: data.countryCode,
            addressText: data.addressText,
            label: data.label,
            lat: data.lat,
            lng: data.lng,
            isActive: false,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            acceptOrders: true,
            createdAt: now,
            updatedAt: now,
            deliveryRadius: data.deliveryRadius,
            currency: data.currency,
            commission: 0
        }))

        return branch;
    }

    findByRestaurantId = async (restaurantId: number) => {
        return await findByRestaurantId(restaurantId);
    }

    findByIdWithRestaurant = async (branchId: number): Promise<BranchWithRestaurant | null> => {
        const branch = await findBranchById(branchId);
        if (!branch) return null;
        const restaurant = await findRestaurantById(branch.restaurantId);
        if (!restaurant) return null;
        return {
            branch,
            restaurantStatus: restaurant.status,
            restaurantOwnerId: Number(restaurant.ownerId),
        };
    }

    findByIdsWithRestaurant = async (branchIds: number[]): Promise<BranchWithRestaurant[]> => {
        if (branchIds.length === 0) return [];
        const branches = await findBranchesByIds(branchIds);
        if (branches.length === 0) return [];
        const restaurants = await findRestaurantsByIds(Array.from(new Set(branches.map((b) => b.restaurantId))));
        const byId = new Map(restaurants.map((r) => [Number(r.id), r]));
        const out: BranchWithRestaurant[] = [];
        for (const branch of branches) {
            const restaurant = byId.get(Number(branch.restaurantId));
            if (!restaurant) continue;
            out.push({
                branch,
                restaurantStatus: restaurant.status,
                restaurantOwnerId: Number(restaurant.ownerId),
            });
        }
        return out;
    }

    update = async (branchId: number, data: UpdateBranchDTO, userRole: SystemRole, userId: number) => {
        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFoundError;
        }

        const restaurant = await findRestaurantById(branch.restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }

        const trx = await db.transaction();
        try {
            const res = await updateBranch(branchId, data, trx);

            await insertOutboxEvent(trx, {
                aggregateType: "restaurant_branches",
                aggregateId: branchId,
                eventType: EVENT_TYPES.BRANCH_UPDATED,
                payload: { branchId }
            });
            await trx.commit();
            await cacheProvider.del(`GET:/api/internal/branches/${branchId}`);
            return res;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    updateStatus = async (branchId: number, data: UpdateBranchStatusDTO, userRole: SystemRole) => {

        if (userRole !== SystemRole.SYSTEM_ADMIN) {
            throw UnAuthorisedError;
        }

        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFoundError;
        }

        const trx = await db.transaction();
        try {
            const res = await updateBranchStatus(branchId, data, trx);

            await insertOutboxEvent(trx, {
                aggregateType: "restaurant_branches",
                aggregateId: branchId,
                eventType: data.isActive ? EVENT_TYPES.BRANCH_UPDATED : EVENT_TYPES.BRANCH_DEACTIVATED,
                payload: { branchId }
            });
            await trx.commit();
            await cacheProvider.del(`GET:/api/internal/branches/${branchId}`);
            return res;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
}

