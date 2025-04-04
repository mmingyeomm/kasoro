import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRoomController } from './gameroom.controller';
import { GameRoomService } from './gameroom.service';
import { GameRoomRepository } from './gameroom.repository';
import { GameRoom } from './entities/gameroom.entity';
import { GameRoomGateway } from './gameroom.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([GameRoom])],
  controllers: [GameRoomController],
  providers: [GameRoomService, GameRoomRepository, GameRoomGateway],
  exports: [GameRoomService, GameRoomGateway],
})
export class GameRoomModule {}
