import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { Community } from './entities/community.entity';
import { AuthGuard } from '../auth/auth.guard';
import { WalletGuard } from '../auth/wallet.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('communities')
@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

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
  @UseGuards(AuthGuard, WalletGuard)
  async createCommunity(
    @Body() createCommunityDto: CreateCommunityDto,
    @CurrentUser() user: any,
  ): Promise<Community> {
    console.log('User from auth:', user);
    // Use user.xId since we're linking wallets to Twitter IDs
    const userId = user.xId || user.id;
    return this.communityService.createCommunity(createCommunityDto, userId);
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
}
