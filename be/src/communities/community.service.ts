import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { Community } from './entities/community.entity';
import { Depositor } from './entities/depositor.entity';
import { CommunityRepository } from './community.repository';
import { DepositorRepository } from './depositor.repository';
import { CommunityGateway } from './community.gateway';
import { UserService } from '../user/user.service';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly depositorRepository: DepositorRepository,
    @Inject(forwardRef(() => CommunityGateway))
    private readonly communityGateway: CommunityGateway,
    private readonly userService: UserService
  ) {}

  async getAllCommunities(): Promise<Community[]> {
    return this.communityRepository.find({
      relations: ['creator'],
      order: {
        lastMessageTime: 'DESC',
        createdAt: 'DESC',
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        creatorId: true,
        lastMessageTime: true,
        contractAddress: true,
        bountyAmount: true,
        timeLimit: true,
        baseFeePercentage: true,
        walletAddress: true,
        creator: {
          id: true,
          xId: true,
          username: true,
          displayName: true,
          profileImageUrl: true,
        }
      }
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
    // Handle the case when no wallet address is provided
    const community = this.communityRepository.create({
      ...createCommunityDto,
      creatorId: userId,
      // Set bountyAmount to 0 if walletAddress is not provided
      bountyAmount: createCommunityDto.walletAddress ? createCommunityDto.bountyAmount : 0,
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

  async updateBounty(id: string, amount: number, userId: string, walletAddress: string): Promise<void> {
    console.log(`[updateBounty] Started: communityId=${id}, amount=${amount}, userId=${userId}, walletAddress=${walletAddress}`);
    
    // First get the community to check if it exists
    console.log(`[updateBounty] Fetching community with ID: ${id}`);
    const community = await this.getCommunityById(id);
    console.log(`[updateBounty] Found community: ${community.name}, current bounty: ${community.bountyAmount}`);
    
    // Get user details for the broadcast
    console.log(`[updateBounty] Fetching user with ID: ${userId}`);
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    console.log(`[updateBounty] Found user: ${user.username}`);
    
    // Find existing depositor record for this user and community
    console.log(`[updateBounty] Checking for existing depositor record for user ${userId} in community ${id}`);
    let existingDepositor = await this.depositorRepository.findByUserAndCommunity(userId, id);
    
    if (existingDepositor) {
      console.log(`[updateBounty] Found existing depositor record: previous amount=${existingDepositor.amount.toFixed(2)}`);
      
      // Ensure both values are treated as numbers
      const currentAmount = parseFloat(existingDepositor.amount.toString());
      const additionalAmount = parseFloat(amount.toString());
      const newTotal = currentAmount + additionalAmount;
      
      console.log(`[updateBounty] Updating depositor record: ${currentAmount.toFixed(2)} + ${additionalAmount.toFixed(2)} = ${newTotal.toFixed(2)}`);
      
      // Update the existing record
      existingDepositor.amount = newTotal;
      existingDepositor.depositedAt = new Date(); // Update timestamp to current time
      await this.depositorRepository.save(existingDepositor);
      
      console.log(`[updateBounty] Updated existing deposit for user ${userId} in community ${id} to ${newTotal.toFixed(2)} SOL`);
    } else {
      console.log(`[updateBounty] No existing deposit found, creating new record with amount ${amount}`);
      // Create a new depositor record if one doesn't exist
      const depositor = this.depositorRepository.create({
        communityId: id,
        userId,
        amount,
        walletAddress
      });
      
      // Save the depositor record
      await this.depositorRepository.save(depositor);
      console.log(`[updateBounty] Created new deposit for user ${userId} in community ${id} of ${amount} SOL`);
    }
    
    // Update the bounty amount - add the new deposit to the existing amount
    const currentBounty = parseFloat((community.bountyAmount || 0).toString());
    const amountToAdd = parseFloat(amount.toString());
    const newBountyAmount = currentBounty + amountToAdd;
    
    console.log(`[updateBounty] Updating community bounty: ${currentBounty} + ${amountToAdd} = ${newBountyAmount}`);
    
    // Instead of using update method which might skip entity hooks, use save method:
    community.bountyAmount = newBountyAmount;
    await this.communityRepository.save(community);
    
    console.log(`[updateBounty] Community bounty updated successfully to ${community.bountyAmount}`);
    
    // Broadcast the deposit update
    this.communityGateway.broadcastDeposit(id, amount, user.username);
    console.log(`[updateBounty] Broadcast complete`);
  }
  

  async getCommunityDepositors(id: string): Promise<Depositor[]> {
    // First check if the community exists
    await this.getCommunityById(id);
    
    // Then get all depositors for the community
    return this.depositorRepository.findByCommunity(id);
  }

  async getCommunityWithDepositors(id: string): Promise<Community> {
    const community = await this.communityRepository.findOne({
      where: { id },
      relations: ['creator', 'depositors', 'depositors.user'],
    });

    if (!community) {
      throw new NotFoundException(`Community with ID ${id} not found`);
    }

    return community;
  }
}