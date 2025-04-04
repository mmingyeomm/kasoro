import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CommunityService } from '../communities/community.service';
import { CommunityGateway } from '../communities/community.gateway';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private communityService: CommunityService,
    private communityGateway: CommunityGateway,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
    try {
      // Check if community exists
      await this.communityService.getCommunityById(createMessageDto.communityId);
      
      // Get current time for both message creation and community update
      const currentTime = new Date();
      
      // Create and save the message
      const message = this.messageRepository.create({
        content: createMessageDto.content,
        senderId: userId,
        communityId: createMessageDto.communityId,
        createdAt: currentTime,
      });
      
      const savedMessage = await this.messageRepository.save(message);
      
      // Update the community's lastMessageTime
      await this.communityService.updateLastMessageTime(createMessageDto.communityId, currentTime);
      
      // Broadcast the update to all clients in the room
      this.communityGateway.broadcastLastMessageUpdate(createMessageDto.communityId, currentTime);
      
      return savedMessage;
    } catch (error) {
      throw error;
    }
  }
}
