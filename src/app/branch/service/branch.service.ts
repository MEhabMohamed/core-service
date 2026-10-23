import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { SystemRole } from "../../user/enums";
import { CreateBranchDTO, UpdateBranchDTO } from "../dto/branch.dto";
import { Branch } from "../entity/branch.entity";
import { BranchNotFoundError, RestaurantNotFoundError, UnauthorizedError } from "../errors";
import { createBranch, findBranchById, findByRestaurantId, findNearByBranches, updateBranch, updateBranchStatus } from "../repositoty/branch.repo";
import { injectable } from "tsyringe";

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
            throw UnauthorizedError;
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
        const rows = await findByRestaurantId(restaurantId);
        return rows;
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
            throw UnauthorizedError;
        }

        const now = new Date();

        const updatedBranch = await updateBranch(branchId, {
            countryCode: data.countryCode,
            addressText: data.addressText,
            label: data.label,
            lat: data.lat,
            lng: data.lng,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            updatedAt: now,
            deliveryRadius: data.deliveryRadius,
            currency: data.currency,
            commission: data.commission
        })

        return updatedBranch;
    }

    updateStatus = async (branchId: number, commission: number, isActive: boolean, userRole: SystemRole) => {
        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFoundError;
        }
        if (userRole !== SystemRole.SYSTEM_ADMIN) {
            throw UnauthorizedError;
        }
        const updatedBranch = await updateBranchStatus(branchId, commission, isActive);
        return updatedBranch;
    }
}