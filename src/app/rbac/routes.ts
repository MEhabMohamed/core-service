import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";
import { Tokens } from "../../lib/di/tokens";
import { MemberController } from "./controller/member.controller";
import { container } from "../../lib/di/container";

import { requireInternalApiKey } from "../../lib/auth/api-key";
import { withCache } from "../../lib/cache/withCache";

export const rbacRouter = Router();

const memberController = container.resolve<MemberController>(Tokens.MemberController);

rbacRouter.get("/internal/rbac/permissions", requireInternalApiKey, withCache(60), memberController.getInternalRolePermissions);


rbacRouter.post("/restaurants/:restaurantId/members",
    authenticate,
    rbac({
        resource: "core:member",
        action: "create"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.createMember);

rbacRouter.get("/restaurants/:restaurantId/members",
    authenticate,
    rbac({
        resource: "core:member",
        action: "read"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.listMembers);

rbacRouter.patch("/restaurants/:restaurantId/members/:memberId",
    authenticate,
    rbac({
        resource: "core:member",
        action: "update"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.updateMember);

rbacRouter.delete("/restaurants/:restaurantId/members/:memberId",
    authenticate,
    rbac({
        resource: "core:member",
        action: "delete"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.deleteMember);

rbacRouter.put("/restaurants/:restaurantId/members/:memberId/branches",
    authenticate,
    rbac({
        resource: "core:member",
        action: "update"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.updateMemberBranches);

rbacRouter.get("/roles/:role/permissions", memberController.getRolePermissions);