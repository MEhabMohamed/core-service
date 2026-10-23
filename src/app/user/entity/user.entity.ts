import { SystemRole } from "../enums";

export class User {
    id: number;
    email: string;
    passwordHash: string;
    systemRole: SystemRole;
    name: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;

    constructor(data: Partial<User>) {
        this.id = data.id!;
        this.email = data.email!;
        this.passwordHash = data.passwordHash!;
        this.systemRole = data.systemRole!;
        this.name = data.name!;
        this.phone = data.phone!;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.deletedAt = data.deletedAt ?? null;
    }
}