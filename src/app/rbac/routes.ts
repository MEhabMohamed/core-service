import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";
import { Tokens } from "../../lib/di/tokens";
import { MemberController } from "./controller/member.controller";
import { container } from "../../lib/di/container";

import { requireInternalApiKey } from "../../lib/auth/api-key";

export const rbacRoutes = Router();

const memberController = container.resolve<MemberController>(Tokens.MemberController);

rbacRoutes.get("/internal/rbac/permissions", requireInternalApiKey, memberController.getInternalRolePermissions);


rbacRoutes.post("/restaurants/:restaurantId/members",
    authenticate,
    rbac({
        resource: "core:member",
        action: "create"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.createMember);

rbacRoutes.get("/restaurants/:restaurantId/members",
    authenticate,
    rbac({
        resource: "core:member",
        action: "read"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.listMembers);

rbacRoutes.patch("/restaurants/:restaurantId/members/:memberId",
    authenticate,
    rbac({
        resource: "core:member",
        action: "update"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.updateMember);

rbacRoutes.delete("/restaurants/:restaurantId/members/:memberId",
    authenticate,
    rbac({
        resource: "core:member",
        action: "delete"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.deleteMember);

rbacRoutes.put("/restaurants/:restaurantId/members/:memberId/branches",
    authenticate,
    rbac({
        resource: "core:member",
        action: "update"
    }),
    requireRestaurantMember("restaurantId"),
    memberController.updateMemberBranches);

rbacRoutes.get("/roles/:role/permissions", memberController.getRolePermissions);