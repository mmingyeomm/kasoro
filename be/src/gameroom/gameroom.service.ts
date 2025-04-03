import { Injectable, NotFoundException } from '@nestjs/common';
import { GameRoomRepository } from './gameroom.repository';
import { CreateGameRoomDto } from './dto/create-gameroom.dto';
import { GameRoom } from './entities/gameroom.entity';

@Injectable()
export class GameRoomService {
  constructor(private gameRoomRepository: GameRoomRepository) {}

  async getAllGameRooms(): Promise<GameRoom[]> {
    return this.gameRoomRepository.findAll();
  }

  async getGameRoomById(id: string): Promise<GameRoom> {
    const gameRoom = await this.gameRoomRepository.findOne({ where: { id } });
    if (!gameRoom) {
      throw new NotFoundException(`Game room with ID ${id} not found`);
    }
    return gameRoom;
  }

  async createGameRoom(createGameRoomDto: CreateGameRoomDto, xid: string): Promise<GameRoom> {

    console.log( "2-------------------------- "+ xid)


    return this.gameRoomRepository.create({
      ...createGameRoomDto,
      
    });
  }

  async getGameRoomWithMessages(id: string): Promise<GameRoom> {
    const gameRoom = await this.gameRoomRepository.findWithMessages(id);
    if (!gameRoom) {
      throw new NotFoundException(`Game room with ID ${id} not found`);
    }
    return gameRoom;
  }
}