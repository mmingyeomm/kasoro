import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findByGameRoom(gameRoomId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { gameRoomId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(message: Partial<Message>): Promise<Message> {
    const newMessage = this.messageRepository.create(message);
    return this.messageRepository.save(newMessage);
  }

  async save(message: Message): Promise<Message> {
    return this.messageRepository.save(message);
  }
}
