import { IsArray, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MemberStatus } from "../enums";

export class CreateMemberDTO {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    phoneNumber!: string;

    @IsString()
    @IsNotEmpty()
    role!: string;

    @IsArray()
    @IsOptional()
    branchIds!: number[];
}

export class UpdateMemberDTO {
    @IsString()
    @IsOptional()
    role!: string;

    @IsIn(['active', 'inactive', 'suspended'])
    @IsString()
    status!: MemberStatus;
}

export class UpdateMemberBranchesDTO {
    @IsArray()
    branchIds!: number[];
}