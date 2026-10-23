import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length, MaxLength, MinLength, ValidateNested } from "class-validator";
import { SystemRole } from "../../user/enums";
import { CreateRestaurantDTO } from "../../restaurant/dto/restaurant.dto";
import { Type } from "class-transformer";

export class RegisterDTO {
    @IsString()
    @MinLength(1)
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
    }, {
        message: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
    })
    password!: string;

    @MinLength(10)
    @MaxLength(11)
    phone!: string;

    @IsEnum(SystemRole)
    role!: SystemRole;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateRestaurantDTO)
    restaurant?: CreateRestaurantDTO;
}

export class LoginDTO {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class ForgotPasswordDTO {
    @IsEmail()
    email!: string;
}

export class ResetPasswordDTO {
    @IsEmail()
    email!: string;

    @IsString()
    @Length(6)
    otp!: string;

    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
    }, {
        message: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number"
    })
    newPassword!: string;
}