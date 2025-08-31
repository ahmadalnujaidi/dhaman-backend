import { Transform, Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateWarrantyDto {
    @IsString()
    @IsNotEmpty()
    item_name: string;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    purchase_date: Date;

    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber()
    @IsNotEmpty()
    duration: number;

    @IsString()
    @IsOptional()
    notes: string;

    @IsString()
    @IsOptional()
    receipt: string;

    @IsString()
    @IsOptional()
    item_image: string;

}
