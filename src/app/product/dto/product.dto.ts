import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description!: string;

    @IsString()
    @IsOptional()
    imageURL!: string;

    @IsString()
    @IsOptional()
    categoryName!: string;
}

export class UpdateProductDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description!: string;

    @IsString()
    @IsOptional()
    imageURL!: string;

    @IsString()
    @IsOptional()
    categoryName!: string;

    @IsInt()
    @IsOptional()
    @Min(0)
    price!: number;

    @IsInt()
    @IsOptional()
    @Min(0)
    stock!: number;

    @IsBoolean()
    @IsOptional()
    isAvailable!: boolean;
}

