import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GameRoomService } from './gameroom.service';
import { CreateGameRoomDto } from './dto/create-gameroom.dto';
import { GameRoom } from './entities/gameroom.entity';
import { AuthGuard } from '../auth/auth.guard';
import { WalletGuard } from '../auth/wallet.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('gamerooms')
export class GameRoomController {
  constructor(private readonly gameRoomService: GameRoomService) {}

  @Get()
  async getAllGameRooms(): Promise<GameRoom[]> {
    return this.gameRoomService.getAllGameRooms();
  }

  @Get(':id')
  async getGameRoomById(@Param('id') id: string): Promise<GameRoom> {
    return this.gameRoomService.getGameRoomById(id);
  }

  @Post()
  @UseGuards(AuthGuard, WalletGuard)
  async createGameRoom(
    @Body() createGameRoomDto: CreateGameRoomDto,
    @CurrentUser() user: any,
  ): Promise<GameRoom> {
    console.log('User from auth:', user);
    // Use user.xId since we're linking wallets to Twitter IDs
    const userId = user.xId || user.id;
    return this.gameRoomService.createGameRoom(createGameRoomDto, userId);
  }

  @Get(':id/messages')
  async getGameRoomWithMessages(@Param('id') id: string): Promise<GameRoom> {
    return this.gameRoomService.getGameRoomWithMessages(id);
  }
}
