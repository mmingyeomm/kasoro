import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { Community } from './entities/community.entity';
import { Depositor } from './entities/depositor.entity';
import { AuthGuard } from '../auth/auth.guard';
import { WalletGuard } from '../auth/wallet.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../user/user.service';

@ApiTags('communities')
@Controller('communities')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly userService: UserService
  ) {}

  @ApiOperation({ summary: 'Get all communities' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all communities',
    type: [Community]
  })
  @Get()
  async getAllCommunities(): Promise<Community[]> {
    return this.communityService.getAllCommunities();
  }

  @ApiOperation({ summary: 'Get a specific community by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The community record',
    type: Community
  })
  @ApiResponse({ status: 404, description: 'Community not found' })
  @Get(':id')
  async getCommunityById(@Param('id') id: string): Promise<Community> {
    return this.communityService.getCommunityById(id);
  }

  @ApiOperation({ summary: 'Create a new community' })
  @ApiResponse({ 
    status: 201, 
    description: 'The community has been successfully created',
    type: Community
  })
  @Post()
  @UseGuards(AuthGuard)
  async createCommunity(
    @Body() createCommunityDto: CreateCommunityDto,
    @CurrentUser() user: any,
  ): Promise<Community> {
    console.log('User from auth:', user);


    console.log(createCommunityDto);
    
    // Get Twitter ID from user session
    const twitterId = user.xId || user.id;
    
    // Find user by Twitter ID to get their internal UUID
    const userEntity = await this.userService.findByXId(twitterId);
    if (!userEntity) {
      throw new Error(`User with Twitter ID ${twitterId} not found`);
    }
    
    // Use the user's internal UUID as creatorId
    return this.communityService.createCommunity(createCommunityDto, userEntity.id);
  }

  @ApiOperation({ summary: 'Get community with all messages' })
  @ApiResponse({ 
    status: 200, 
    description: 'Community with its messages',
    type: Community
  })
  @ApiResponse({ status: 404, description: 'Community not found' })
  @Get(':id/messages')
  async getCommunityWithMessages(@Param('id') id: string): Promise<Community> {
    return this.communityService.getCommunityWithMessages(id);
  }

  @ApiOperation({ summary: 'Deposit bounty to a community' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bounty deposited successfully' 
  })
  @ApiResponse({ status: 404, description: 'Community not found' })
  @Post(':id/deposit')
  @UseGuards(AuthGuard, WalletGuard) // Keep WalletGuard for deposit since it involves actual wallet operations
  async depositBounty(
    @Param('id') id: string,
    @Body() depositData: { amount: number, walletAddress: string },
    @CurrentUser() user: any,
  ): Promise<{ success: boolean, message: string }> {
    console.log(`Deposit request: ${depositData.amount} SOL to community ${id} from wallet ${depositData.walletAddress}`);
    
    // Verify user wallet matches the provided wallet address
    if (user.walletAddress !== depositData.walletAddress) {
      throw new Error('Wallet address does not match user wallet');
    }

    // Find user to get their UUID
    const userEntity = await this.userService.findByXId(user.xId || user.id);
    if (!userEntity) {
      throw new Error(`User with ID ${user.id} not found`);
    }

    // Update bounty and record the deposit
    await this.communityService.updateBounty(
      id, 
      depositData.amount, 
      userEntity.id, 
      depositData.walletAddress
    );
    
    return { 
      success: true, 
      message: `Successfully deposited ${depositData.amount} SOL to community`
    };
  }

  @ApiOperation({ summary: 'Get all depositors for a community' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all depositors for the community',
    type: [Depositor]
  })
  @ApiResponse({ status: 404, description: 'Community not found' })
  @Get(':id/depositors')
  async getCommunityDepositors(@Param('id') id: string): Promise<Depositor[]> {
    return this.communityService.getCommunityDepositors(id);
  }

  @ApiOperation({ summary: 'Get community with its depositors' })
  @ApiResponse({ 
    status: 200, 
    description: 'Community with its depositors',
    type: Community
  })
  @ApiResponse({ status: 404, description: 'Community not found' })
  @Get(':id/with-depositors')
  async getCommunityWithDepositors(@Param('id') id: string): Promise<Community> {
    return this.communityService.getCommunityWithDepositors(id);
  }
}
