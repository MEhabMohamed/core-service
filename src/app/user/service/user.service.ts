import { SystemRole } from "../../user/enums";
import { createUser, findUserById, findUserExistsByEmailOrPhone, updateUserProfile } from "../repository/user.repo";
import { CannotSignUpAsSystemAdmin, UserAlreadyExistError } from "../../auth/errors";
import { hashPassword } from "../../auth/utils";
import { UserNotFoundError } from "../errors";
import { injectable } from "tsyringe";
import { Knex } from "knex";
import { User } from "../entity/user.entity";

export interface CreateUserData {
    email: string;
    phone: string;
    name: string;
    password: string;
    systemRole: SystemRole;
}

@injectable()
export class UserService {
    create = async (data: CreateUserData, trx?: Knex | Knex.Transaction): Promise<User> => {

        const existing = await findUserExistsByEmailOrPhone(data.email, data.phone);

        if (existing) throw UserAlreadyExistError;

        const hashedPassword = data.password ? await hashPassword(data.password) : "";

        const now = new Date();
        return await createUser({
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash: hashedPassword,
            systemRole: data.systemRole,
            createdAt: now,
            updatedAt: now
        }, trx)
    }

    getByUserId = async (userId: number) => {
        const user = await findUserById(userId);
        if (!user) throw UserNotFoundError;
        return {
            id: user.id,
            email: user.email,
            systemRole: user.systemRole,
            name: user.name,
            phone: user.phone
        };
    }

    updateUserProfile = async (userId: number, data: { name: string; phone: string; }) => {
        const user = await updateUserProfile(userId, data);
        return {
            id: user.id,
            email: user.email,
            systemRole: user.systemRole,
            name: user.name,
            phone: user.phone
        };
    }

    getAgentById = async (id: number) => {
        const user = await findUserById(id);
        if (!user) throw UserNotFoundError;
        if (user.systemRole !== SystemRole.DELIVERY_AGENT) {
            // Use UserNotFoundError to avoid enumeration of other user types.
            throw UserNotFoundError;
        }
        return { id: user.id, name: user.name, phone: user.phone };
    }
}