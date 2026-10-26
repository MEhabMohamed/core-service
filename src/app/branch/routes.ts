import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireBranchAccess, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { Tokens } from "../../lib/di/tokens";
import { BranchController } from "./controller/branch.controller";
import { withCache } from "../../lib/cache/withCache";

import { requireInternalApiKey } from "../../lib/auth/api-key";

export const branchRoutes = Router();

const branchController = container.resolve<BranchController>(Tokens.BranchController);

branchRoutes.get('/internal/branches', requireInternalApiKey, withCache(60), branchController.findByIdsWithRestaurant);
branchRoutes.get('/internal/branches/:id', requireInternalApiKey, withCache(60), branchController.findByIdWithRestaurant);

branchRoutes.post('/restaurants/:restaurantId/branches',
    authenticate,
    rbac({
        resource: "core:branch",
        action: "create"
    }),
    requireRestaurantMember("restaurantId"),
    branchController.createBranch);
branchRoutes.get('/restaurants/:restaurantId/branches', branchController.findByRestaurantId);
branchRoutes.get('/branches/nearby', withCache(), branchController.findNearByBranches);
branchRoutes.patch('/branches/:branchId',
    authenticate,
    rbac({
        resource: "core:branch",
        action: "update"
    }),
    requireBranchAccess("branchId"),
    branchController.update);
branchRoutes.patch('/branches/:branchId/status',
    authenticate,
    branchController.updateStatus);
