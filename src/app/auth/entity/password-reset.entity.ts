export class PasswordReset {
    id: number;
    userId: number;
    otpHash: string;
    consumedAt: Date | null;
    createdAt: Date;
    expiresAt: Date;

    constructor(data: Partial<PasswordReset>) {
        this.id = data.id!;
        this.userId = data.userId!;
        this.otpHash = data.otpHash!;
        this.consumedAt = data.consumedAt ?? null;
        this.createdAt = data.createdAt!;
        this.expiresAt = data.expiresAt!;
    }

    isExpired(): boolean {
        return this.expiresAt < new Date()
    }
}