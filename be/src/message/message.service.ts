import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { GameRoomService } from '../gameroom/gameroom.service';
import { UserService } from '../user/user.service';
import { GameRoomGateway } from '../gameroom/gameroom.gateway';

@Injectable()
export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private gameRoomService: GameRoomService,
    private userService: UserService,
    private gameRoomGateway: GameRoomGateway,
  ) {}

  async getMessagesByGameRoom(gameRoomId: string): Promise<Message[]> {
    await this.gameRoomService.getGameRoomById(gameRoomId);
    return this.messageRepository.findByGameRoom(gameRoomId);
  }

  async createMessage(createMessageDto: CreateMessageDto, user: any): Promise<Message> {
    // Check if game room exists
    await this.gameRoomService.getGameRoomById(createMessageDto.gameRoomId);
    
    // Get user information
    const userRecord = await this.userService.findByXId(user.id);
    if (!userRecord) {
      throw new NotFoundException(`User with xId ${user.id} not found`);
    }
    
    // Current timestamp for both message creation and game room update
    const currentTime = new Date();
    
    // Create message
    const message = this.messageRepository.create({
      ...createMessageDto,
      userId: userRecord.id,
      createdAt: currentTime,
    });
    
    // Save the message
    const savedMessage = await this.messageRepository.save(await message);
    
    // Update the game room's lastMessageTime
    await this.gameRoomService.updateLastMessageTime(createMessageDto.gameRoomId, currentTime);
    
    // Broadcast the lastMessageTime update to all clients in the room
    await this.gameRoomGateway.broadcastLastMessageUpdate(
      createMessageDto.gameRoomId,
      currentTime
    );
    
    return savedMessage;
  }
}
