import {
    BranchesNotAssignableToOwnerError,
    CannotCreateUserOwnerError,
    CannotDeleteOwnerError,
    InvalidBranchIdsError,
    MemberNotFoundError,
    RoleNotFoundError,
    UpdateMemberError
} from "../errors";
import { CreateMemberDTO, UpdateMemberBranchesDTO, UpdateMemberDTO } from "../dto/member.dto";
import { findUserByEmail } from "../../user/repository/user.repo";
import { UserAlreadyExistError } from "../../auth/errors";
import { findRoleByName } from "../repository/role.repo";
import { db } from "../../../lib/knex/knex";
import { SystemRole } from "../../user/enums";
import {
    createRestaurantMember,
    deleteMember,
    findMembersByRestaurantId,
    findMemberWithRoleName,
    updateMember
} from "../repository/restaurant-member.repo";
import { MemberStatus } from "../enums";
import { MemberBranch } from "../entity/member-branch.entity.";
import { countBranchesByIdsAndRestaurantId, setMemberBranch } from "../repository/member-branch.repo";
import { mins } from "../../../pkg/utils/times.utils";
import { createPasswordReset } from "../../auth/repository/password-reset.repo";
import { generateOTP, hashOTP } from "../../auth/utils";
import { getPermissionsDetailsByRoleName } from "../repository/permission.repo";
import { Knex } from "knex";
import { RestaurantMember } from "../entity/restaurant-member.entity";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { RestaurantNotFoundError } from "../../branch/errors";
import { inject, injectable } from "tsyringe";
import { Tokens } from "../../../lib/di/tokens";
import { UserService } from "../../user/service/user.service";
import { memberInvitationEmail } from "../templates/member-invitation";
import { NodemailerProvider } from "../../../pkg/email/nodemailer";

@injectable()
export class MemberService {
    constructor(@inject(Tokens.UserService) private readonly userService: UserService,
        @inject(Tokens.EmailProvider) private readonly emailProvider: NodemailerProvider) { }

    createMember = async (restaurantId: number, data: CreateMemberDTO) => {
        if (data.role === "owner") {
            throw CannotCreateUserOwnerError
        }

        const existingUser = await findUserByEmail(data.email)

        if (existingUser) {
            throw UserAlreadyExistError
        }

        const roleId = await findRoleByName(data.role)

        if (!roleId) {
            throw RoleNotFoundError
        }

        const branchIds = data.branchIds || [];
        await this.validateBranchOwnership(branchIds, restaurantId);

        const restaurant = await findRestaurantById(restaurantId)

        if (!restaurant) {
            throw RestaurantNotFoundError
        }

        const trx = await db.transaction();
        try {
            const now = new Date();
            const user = await this.userService.create({
                email: data.email,
                name: data.name,
                phone: data.phoneNumber,
                password: "",
                systemRole: SystemRole.RESTAURANT_USER
            })

            const member = await createRestaurantMember({
                userId: user.id,
                restaurantId,
                roleId,
                status: MemberStatus.INACTIVE,
                createdAt: now,
                updatedAt: now
            }, trx)

            const rows = data.branchIds?.map(id => new MemberBranch({
                memberId: member.id,
                branchId: id,
                createdAt: now
            }))

            await setMemberBranch(member.id, rows, trx)

            const otp = generateOTP();
            const hashedOtp = await hashOTP(otp);

            await createPasswordReset({
                userId: user.id,
                otpHash: hashedOtp,
                expiresAt: new Date(Date.now() + mins(10)),
                createdAt: new Date()
            }, trx)

            const email = memberInvitationEmail(user.name, user.email, otp);
            await this.emailProvider.send(email.to, email.subject, email.body);

            await trx.commit();

        } catch (error) {
            await trx.rollback();
            throw error
        }
    }

    createOwnerMember = async (userId: number, restaurantId: number, trx?: Knex.Transaction): Promise<RestaurantMember> => {
        const roleId = await findRoleByName("owner", trx)

        if (!roleId) {
            throw RoleNotFoundError
        }

        const now = new Date();
        const member = await createRestaurantMember({
            userId,
            restaurantId,
            roleId,
            status: MemberStatus.ACTIVE,
            createdAt: now,
            updatedAt: now
        }, trx)

        return member
    }

    updateMember = async (memberId: number, restaurantId: number, data: UpdateMemberDTO) => {
        const memberData = await findMemberWithRoleName(memberId)

        if (!memberData || Number(memberData.member.restaurantId) !== Number(restaurantId)) {
            throw MemberNotFoundError
        }

        const roleId = await findRoleByName(data.role)

        if (!roleId) {
            throw RoleNotFoundError
        }

        if (!data.role && !data.status) {
            throw UpdateMemberError;
        }

        return await updateMember(memberId, roleId, data.status)
    }

    getRolePermissions = async (roleName: string) => {
        const permissions = await getPermissionsDetailsByRoleName(roleName);

        return { role: roleName, permissions };
    }

    deleteMember = async (memberId: number, restaurantId: number) => {
        const memberData = await findMemberWithRoleName(memberId)

        if (!memberData || Number(memberData.member.restaurantId) !== Number(restaurantId)) {
            throw MemberNotFoundError
        }
        if (memberData.roleName === "owner") {
            throw CannotDeleteOwnerError
        }

        return await deleteMember(memberId)
    }

    listMembers = async (restaurantId: number) => {
        const members = await findMembersByRestaurantId(restaurantId)

        return { data: members }
    }

    validateBranchOwnership = async (branchIds: number[], restaurantId: number) => {
        if (!branchIds || branchIds.length === 0) {
            return;
        }
        const count = await countBranchesByIdsAndRestaurantId(branchIds, restaurantId)
        if (count !== branchIds.length) {
            throw InvalidBranchIdsError;
        }
    }

    updateMemberBranches = async (memberId: number, restaurantId: number, data: UpdateMemberBranchesDTO) => {
        const memberData = await findMemberWithRoleName(memberId)

        if (!memberData || Number(memberData.member.restaurantId) !== Number(restaurantId)) {
            throw MemberNotFoundError
        }

        if (memberData.roleName === 'owner') {
            throw BranchesNotAssignableToOwnerError;
        }

        const branchIds = data.branchIds || [];
        await this.validateBranchOwnership(branchIds, restaurantId);

        const trx = await db.transaction();
        try {
            const now = new Date();
            const rows = data.branchIds?.map(id => new MemberBranch({
                memberId: memberData.member.id,
                branchId: id,
                createdAt: now
            }))

            await setMemberBranch(memberData.member.id, rows, trx)

            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw error
        }
    }
}