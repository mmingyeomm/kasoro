import { Controller, Post, Body, Get, Param, Put, UseGuards, Session } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('x/:xId')
  async findByXId(@Param('xId') xId: string) {
    return this.userService.findByXId(xId);
  }

  @Put('wallet')
  @UseGuards(AuthGuard)
  async linkWallet(@Body() body: { walletAddress: string }, @Session() session: Record<string, any>) {
    if (!session.user || !session.user.id) {
      throw new Error('User not authenticated');
    }

    const xId = session.user.id;
    console.log(`Linking wallet for user with xId: ${xId}`);
    
    try {
      const user = await this.userService.findByXId(xId);
      
      if (!user) {
        throw new Error(`User with xId ${xId} not found`);
      }
      
      user.walletAddress = body.walletAddress;
      await this.userService.update(user.id, { walletAddress: body.walletAddress });
      
      session.user.walletAddress = body.walletAddress;
      
      return { 
        success: true, 
        user: {
          id: user.id,
          xId: user.xId,
          username: user.username,
          walletAddress: user.walletAddress
        }
      };
    } catch (error) {
      console.error(`Error linking wallet: ${error.message}`);
      throw error;
    }
  }

  @Get('wallet/:address')
  async findByWalletAddress(@Param('address') address: string) {
    return this.userService.findByWalletAddress(address);
  }
}
