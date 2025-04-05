import { Controller, Post, Body, UseGuards, Logger, InternalServerErrorException } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  private readonly logger = new Logger(MessageController.name);
  
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
    this.logger.log(`Creating message: ${JSON.stringify(createMessageDto)}`);
    this.logger.log(`User context: ${JSON.stringify(user)}`);

    try {
      // Use user.xId since we're linking to Twitter IDs
      const userId = user.xId || user.id;
      this.logger.log(`Using user ID: ${userId}`);
      
      const message = await this.messageService.createMessage(createMessageDto, userId);
      this.logger.log(`Message created with ID: ${message.id}`);
      
      return message;
    } catch (error) {
      this.logger.error(`Failed to create message: ${error.message}`, error.stack);
      throw error;
    }
  }
}




