import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { Community } from './entities/community.entity';
import { CommunityRepository } from './community.repository';

@Injectable()
export class CommunityService {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async getAllCommunities(): Promise<Community[]> {
    return this.communityRepository.find({
      relations: ['creator'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getCommunityById(id: string): Promise<Community> {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
    }

    return community;
  }

  async createCommunity(createCommunityDto: CreateCommunityDto, userId: string): Promise<Community> {
    const community = this.communityRepository.create({
      ...createCommunityDto,
      creatorId: userId,
    });

    return this.communityRepository.save(community);
  }

  async getCommunityWithMessages(id: string): Promise<Community> {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: ['creator', 'messages', 'messages.sender'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
    }

    return community;
  }

  async updateLastMessageTime(id: string, timestamp: Date = new Date()): Promise<void> {
    // First check if the community exists
    await this.getCommunityById(id);
    
    // Then update the lastMessageTime
    await this.communityRepository.updateLastMessageTime(id, timestamp);
    
    console.log(`Updated lastMessageTime for community ${id} to ${timestamp}`);
  }
}