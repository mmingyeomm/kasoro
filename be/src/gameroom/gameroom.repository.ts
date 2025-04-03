import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameRoom } from './entities/gameroom.entity';

@Injectable()
export class GameRoomRepository {
  constructor(
    @InjectRepository(GameRoom)
    private gameRoomRepository: Repository<GameRoom>,
  ) {}

  async findAll(): Promise<GameRoom[]> {
    return this.gameRoomRepository.find();
  }

  async findOne(params: { where: { id: string } }): Promise<GameRoom | null> {
    return this.gameRoomRepository.findOne(params);
  }

  async create(gameRoom: Partial<GameRoom>): Promise<GameRoom> {
    const newGameRoom = this.gameRoomRepository.create(gameRoom);
    return this.gameRoomRepository.save(newGameRoom);
  }

  async findWithMessages(id: string): Promise<GameRoom | null> {
    return this.gameRoomRepository.findOne({
      where: { id },
      relations: ['messages', 'messages.user'],
      order: { messages: { createdAt: 'ASC' } },
    });
  }
}