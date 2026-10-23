import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Currency } from "../enums";

export class CreateBranchDTO {
    @IsNotEmpty()
    @IsString()
    label!: string;

    @IsNotEmpty()
    @IsString()
    countryCode!: string;

    @IsNotEmpty()
    @IsString()
    addressText!: string;

    @IsNumber()
    lat!: number;

    @IsNumber()
    lng!: number;

    @IsString()
    opensAt!: string;

    @IsString()
    closesAt!: string;

    @IsInt()
    @Min(0)
    deliveryRadius!: number;

    @IsEnum(Currency)
    currency!: Currency;
}

export class UpdateBranchDTO {
    @IsString()
    @IsOptional()
    label?: string;

    @IsString()
    @IsOptional()
    countryCode?: string;

    @IsString()
    @IsOptional()
    addressText?: string;

    @IsNumber()
    @IsOptional()
    lat?: number;

    @IsNumber()
    @IsOptional()
    lng?: number;

    @IsString()
    @IsOptional()
    opensAt?: string;

    @IsString()
    @IsOptional()
    closesAt?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    deliveryRadius?: number;

    @IsEnum(Currency)
    @IsOptional()
    currency?: Currency;

    @IsNumber()
    @IsOptional()
    commission?: number;

    @IsBoolean()
    @IsOptional()
    acceptOrders?: boolean;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}