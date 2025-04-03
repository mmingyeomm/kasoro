import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('gameroom/:gameRoomId')
  async getMessagesByGameRoom(@Param('gameRoomId') gameRoomId: string): Promise<Message[]> {
    return this.messageService.getMessagesByGameRoom(gameRoomId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
  ): Promise<Message> {
    return this.messageService.createMessage(createMessageDto, user);
  }
}




