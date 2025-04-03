import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateGameRoomDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
  
  @IsNumber()
  @Min(0)
  bountyAmount: number;
  
  @IsNumber()
  @Min(1)
  timeLimit: number;
  
  @IsNumber()
  @Min(0)
  @Max(100)
  baseFeePercentage: number;

  @IsString()
  @IsOptional()
  walletAddress?: string;
}
