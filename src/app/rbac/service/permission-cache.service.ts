import { injectable } from "tsyringe";
import { hours } from "../../../pkg/utils/times.utils";
import { getPermissionByRoleName } from "../repository/permission.repo";

@injectable()
export class PermissionCacheService {
    private cache: Map<string, { permission: string[], cachedAt: number }> = new Map();
    private readonly TTL = hours(1);

    // get or fetch if needed
    async getPermission(roleName: string): Promise<string[]> {
        const entry = this.cache.get(roleName)
        if (entry && Date.now() - entry.cachedAt < this.TTL) {
            return entry.permission;
        }
        const permissions = await getPermissionByRoleName(roleName);

        if (permissions) {
            this.cache.set(roleName, {
                permission: permissions,
                cachedAt: Date.now()
            })
        }
        return permissions;
    }

    hasPermission(permissions: string[], resource: string, action: string): boolean {
        if (!permissions) return false;
        const perm = `${resource}:${action}`;
        return permissions.includes(perm);
    }
}