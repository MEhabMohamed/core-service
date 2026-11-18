import { NextFunction, Request, Response } from "express";
import { NotAuthenticated, UnAuthorisedError } from "../auth/errors";
import { SystemRole } from "../../app/user/enums";
import { PermissionCacheService } from "../../app/rbac/service/permission-cache.service";
import { Tokens } from "../di/tokens";
import { container } from "../di/container";

export interface RBACOptions {
    resource: string;
    action: string;
    allowSystemAdmin?: boolean;
}

export function rbac(options: RBACOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw NotAuthenticated;
            }


            const { resource, action, allowSystemAdmin = true } = options



            if (allowSystemAdmin && req.user.role === SystemRole.SYSTEM_ADMIN) {
                return next();
            }

            if (req.user.role === SystemRole.RESTAURANT_USER) {
                if (!req.user.restaurantRole) {
                    return res.status(403).json({
                        message: "Permission denied: No restaurant role assigned"
                    });
                };
                const permissionCacheService = container.resolve<PermissionCacheService>(Tokens.PermissionCacheService);
                const permissions = await permissionCacheService.getPermission(req.user.restaurantRole!);
                if (!permissionCacheService.hasPermission(permissions, resource, action)) {
                    return res.status(403).json({
                        message: "Permission denied"
                    })
                };
                return next();
            }

            return res.status(403).json({
                message: "Permission denied"
            })
        } catch (error) {
            next(error)
        }
    }
}

export function requireSystemRole(userRole: SystemRole, allowed: SystemRole[]) {
    if (!allowed.includes(userRole)) {
        throw UnAuthorisedError;
    }
}

export function requireRestaurantMember(paramName: string = "restaurantId") {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = parseInt(req.params[paramName] as string);
            if (!restaurantId) {
                return res.status(500).json({
                    message: "Something went wrong"
                })
            }

            if (req.user?.role === SystemRole.SYSTEM_ADMIN) {
                return next()
            }

            if (Number(req.user?.restaurantId) !== Number(restaurantId)) {
                return res.status(403).json({
                    message: "Permission denied"
                })
            }

            next();

        } catch (error) {
            next(error)
        }
    }
}

export function requireBranchAccess(paramName: string = "branchId") {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user?.role === SystemRole.SYSTEM_ADMIN) {
                return next();
            }

            if (req.user?.restaurantRole === "owner") {
                return next();
            }

            const branchId = parseInt(req.params[paramName] as string || req.query[paramName] as string);
            if (!branchId) {
                return next();
            }

            const userBranchIds = req.user?.branchIds || [];
            if (!userBranchIds.includes(branchId)) {
                return res.status(403).json({
                    message: "Permission denied"
                });
            }

            return next();

        } catch (error) {
            next(error)
        }
    }
}