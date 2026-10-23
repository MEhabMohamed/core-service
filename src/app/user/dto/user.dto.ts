import {
    IsString,
    MaxLength,
    MinLength
} from "class-validator";

export class UserUpdateDTO {
    @IsString()
    @MinLength(1)
    name!: string;

    @MinLength(10)
    @MaxLength(11)
    phone!: string;
}