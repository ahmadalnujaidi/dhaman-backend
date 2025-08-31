import { IsNumber, Min } from 'class-validator';

export class UpdateItemCountDto {
  @IsNumber()
  @Min(0)
  item_count: number;
}
