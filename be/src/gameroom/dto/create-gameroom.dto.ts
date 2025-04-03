import { IsString, IsOptional } from 'class-validator';

export class CreateGameRoomDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
