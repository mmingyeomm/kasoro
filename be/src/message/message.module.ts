import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';
import { Message } from './entities/message.entity';
import { GameRoomModule } from '../gameroom/gameroom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    GameRoomModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
  exports: [MessageService],
})
export class MessageModule {}
