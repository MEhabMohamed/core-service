import { inject, injectable } from "tsyringe";
import { db } from "../../../lib/knex/knex";
import { mins } from "../../../pkg/utils/times.utils";
import { findBranchesByMemberId } from "../../rbac/repository/member-branch.repo";
import { activateMember, findRestaurantMemberWithRole } from "../../rbac/repository/restaurant-member.repo";
import { MemberService } from "../../rbac/service/member.service";
import { RestaurantService } from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import {
    findUserByEmail,
    findUserById,
    updateUserPassword
} from "../../user/repository/user.repo";
import { UserService } from "../../user/service/user.service";
import {
    ForgotPasswordDTO,
    LoginDTO,
    RegisterDTO,
    ResetPasswordDTO
} from "../dto/auth.dto";
import {
    CannotSignUpAsSystemAdmin,
    IncorrectCredentials,
    InvalidOrExpiredOTP,
    RestaurantDataRequiredError
} from "../errors";
import {
    createPasswordReset,
    findLatestPasswordResetByUserId,
    updatePasswordResetConsumedAt
} from "../repository/password-reset.repo";
import {
    comparePassword,
    createAccessToken,
    createRefreshToken,
    generateOTP,
    hashOTP,
    hashPassword,
    verfiyRefreshToken
} from "../utils";
import { Tokens } from "../../../lib/di/tokens";
import { passwordResetEmail } from "../templates/reset-password.template";
import { IEmailProvider } from "../../../pkg/email/email.interface";

@injectable()
export class AuthService {

    constructor(
        @inject(Tokens.RestaurantService)
        private readonly restaurantService: RestaurantService,
        @inject(Tokens.UserService)
        private readonly userService: UserService,
        @inject(Tokens.MemberService)
        private readonly memberService: MemberService,
        @inject(Tokens.EmailProvider)
        private readonly emailProvider: IEmailProvider
    ) { }

    register = async (data: RegisterDTO) => {

        if (data.role === SystemRole.SYSTEM_ADMIN) {
            throw CannotSignUpAsSystemAdmin
        }

        const trx = await db.transaction();
        let user;
        let restaurant;
        let restaurantMemberInfo: { restaurantId?: number, restaurantRole?: string, branchIds?: number[] } = {};

        try {
            user = await this.userService.create({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                systemRole: data.role
            }, trx)

            if (data.role == SystemRole.RESTAURANT_USER) {
                if (data.restaurant == undefined) {
                    throw RestaurantDataRequiredError
                }

                restaurant = await this.restaurantService.create(user.id, data.restaurant, trx);
                await this.memberService.createOwnerMember(user.id, restaurant.id, trx);
                restaurantMemberInfo = {
                    restaurantId: restaurant.id,
                    restaurantRole: 'owner',
                    branchIds: []
                }
            }

            await trx.commit();
        }
        catch (e) { await trx.rollback(); throw e; }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
        }

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        return {
            message: "User registered successfully",
            accessToken, refreshToken, user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                systemRole: user.systemRole,
                createdAt: user.createdAt
            },
            restaurant
        }
    }

    login = async (data: LoginDTO) => {
        const user = await findUserByEmail(data.email);

        if (!user) throw IncorrectCredentials;

        const match = await comparePassword(data.password, user.passwordHash);

        if (!match) throw IncorrectCredentials;

        let restaurantMemberInfo = null;

        if (user.systemRole === SystemRole.RESTAURANT_USER) {
            const memberData = await findRestaurantMemberWithRole(user.id);
            if (memberData) {
                const branchIds = await findBranchesByMemberId(memberData.member.id);
                restaurantMemberInfo = {
                    restaurantId: memberData.member.restaurantId,
                    restaurantRole: memberData.roleName,
                    branchIds
                }
            }
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
        }

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        return {
            message: "User logged in successfully",
            accessToken, refreshToken, user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                systemRole: user.systemRole,
                createdAt: user.createdAt
            }
        }
    }

    forgotPassword = async (data: ForgotPasswordDTO) => {
        const user = await findUserByEmail(data.email);

        if (!user) {
            return
        };

        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);

        await createPasswordReset({
            userId: user.id,
            otpHash: hashedOtp,
            expiresAt: new Date(Date.now() + mins(10)),
            createdAt: new Date()
        });

        const email = passwordResetEmail(user.name, user.email, otp);
        const response = await this.emailProvider.send(email.to, email.subject, email.body);

        return response;
    }

    resetPassword = async (data: ResetPasswordDTO) => {
        const user = await findUserByEmail(data.email);

        if (!user) throw InvalidOrExpiredOTP;

        const reset = await findLatestPasswordResetByUserId(user.id);

        if (!reset) {
            throw InvalidOrExpiredOTP;
        }

        const inputOTPHash = await hashOTP(data.otp);

        if (inputOTPHash !== reset.otpHash || reset.isExpired()) {
            throw InvalidOrExpiredOTP;
        };

        const hashedPassword = await hashPassword(data.newPassword);

        await updateUserPassword(user.id, hashedPassword);

        await updatePasswordResetConsumedAt(reset.id);

        return user;
    }

    refreshAccessToken = async (refreshToken: string) => {
        const decoded = verfiyRefreshToken(refreshToken);
        const user = await findUserById(decoded.userId);
        if (!user) {
            throw InvalidOrExpiredOTP;
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            restaurantId: decoded.restaurantId,
            restaurantRole: decoded.restaurantRole,
            branchIds: decoded.branchIds
        }
        const accessToken = createAccessToken(payload);
        return {
            message: "Access token refreshed successfully",
            accessToken, refreshToken
        }
    }

    acceptInvite = async (data: ResetPasswordDTO) => {
        const user = await this.resetPassword(data);

        await activateMember(user.id)
    }
}