import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ summary: 'Create a new message in a community' })
  @ApiResponse({ 
    status: 201, 
    description: 'The message has been successfully created',
    type: Message
  })
  @Post()
  @UseGuards(AuthGuard)
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
  ): Promise<Message> {
    // Use user.xId since we're linking to Twitter IDs
    const userId = user.xId || user.id;
    return this.messageService.createMessage(createMessageDto, userId);
  }
}




