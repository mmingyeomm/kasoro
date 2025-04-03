import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { GameRoomService } from '../gameroom/gameroom.service';

@Injectable()
export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private gameRoomService: GameRoomService,
  ) {}

  async getMessagesByGameRoom(gameRoomId: string): Promise<Message[]> {
    // Verify the game room exists
    await this.gameRoomService.getGameRoomById(gameRoomId);
    return this.messageRepository.findByGameRoom(gameRoomId);
  }

  async createMessage(createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
    // Verify the game room exists
    await this.gameRoomService.getGameRoomById(createMessageDto.gameRoomId);
    
    return this.messageRepository.create({
      ...createMessageDto,
      userId,
    });
  }
}
