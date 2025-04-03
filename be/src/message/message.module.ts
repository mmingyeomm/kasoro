import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';
import { Message } from './entities/message.entity';
import { GameRoomModule } from '../gameroom/gameroom.module';
import { UserModule } from '../user/user.module'; // UserModule 추가

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    GameRoomModule,
    UserModule, // UserModule 추가
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
  exports: [MessageService],
})
export class MessageModule {}
