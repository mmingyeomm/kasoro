import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CommunityService } from '../communities/community.service';
import { CommunityGateway } from '../communities/community.gateway';
import { UserService } from '../user/user.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private communityService: CommunityService,
    private communityGateway: CommunityGateway,
    private userService: UserService
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, twitterId: string): Promise<Message> {
    try {
      // Check if community exists
      await this.communityService.getCommunityById(createMessageDto.communityId);
      
      // Find the user by Twitter ID to get their internal UUID
      const user = await this.userService.findByXId(twitterId);
      if (!user) {
        throw new NotFoundException(`User with Twitter ID ${twitterId} not found`);
      }
      
      // Get current time for both message creation and community update
      const currentTime = new Date();
      
      // Create and save the message using the user's internal UUID
      const messageData: Partial<Message> = {
        content: createMessageDto.content,
        senderId: user.id, // Use the user's internal UUID, not Twitter ID
        communityId: createMessageDto.communityId,
        createdAt: currentTime,
      };
      
      // Only set imageURL if imageLink is provided
      if (createMessageDto.imageLink) {
        messageData.imageURL = createMessageDto.imageLink;
      }
      
      const message = this.messageRepository.create(messageData);
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
