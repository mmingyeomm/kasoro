import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { GameRoomService } from '../gameroom/gameroom.service';
import { UserService } from '../user/user.service'; // UserService 추가

@Injectable()
export class MessageService {
  constructor(
    private messageRepository: MessageRepository,
    private gameRoomService: GameRoomService,
    private userService: UserService, // UserService 주입
  ) {}

  async getMessagesByGameRoom(gameRoomId: string): Promise<Message[]> {
    await this.gameRoomService.getGameRoomById(gameRoomId);
    return this.messageRepository.findByGameRoom(gameRoomId);
  }

  async createMessage(createMessageDto: CreateMessageDto, user: any): Promise<Message> {
    // 게임룸 존재 확인
    await this.gameRoomService.getGameRoomById(createMessageDto.gameRoomId);
    
    // user.id가 실제로는 xId인 경우
    const userRecord = await this.userService.findByXId(user.id);
    if (!userRecord) {
      throw new NotFoundException(`User with xId ${user.id} not found`);
    }
    
    // Current timestamp for both message creation and game room update
    const currentTime = new Date();
    
    // 메시지 생성
    const message = this.messageRepository.create({
      ...createMessageDto,
      userId: userRecord.id, // 실제 UUID 형식의 사용자 ID 사용
      createdAt: currentTime, // Explicitly set creation time
    });
    
    // Save the message
    const savedMessage = await this.messageRepository.save(await message);

    console.log(1)
    
    // Update the game room's lastMessageTime
    await this.gameRoomService.updateLastMessageTime(createMessageDto.gameRoomId, currentTime);

    console.log(2)

    
    return savedMessage;
  }
}
