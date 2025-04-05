import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateCommunityDto {
  @ApiProperty({
    description: 'Name of the community',
    example: 'Blockchain Enthusiasts'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the community',
    example: 'A place to discuss blockchain technology'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Bounty amount for the community in SOL',
    example: 1.5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bountyAmount?: number;

  @ApiPropertyOptional({
    description: 'Time limit for the community in minutes',
    example: 60
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeLimit?: number;

  @ApiPropertyOptional({
    description: 'Base fee percentage for the community',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  baseFeePercentage?: number;

  @ApiPropertyOptional({
    description: 'Smart contract address for the community',
    example: '0x123abc456def789ghi'
  })
  @IsOptional()
  @IsString()
  contractAddress?: string;

  @ApiPropertyOptional({
    description: 'Wallet address of the creator',
    example: '0x123abc456def789ghi'
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiPropertyOptional({
    description: 'Image URL for the community',
    example: 'https://example.com/image.jpg'
  })
  @IsOptional()
  @IsString()
  imageURL?: string;
}
