import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByXId(createUserDto.xId);
    if (existingUser) {
      return this.update(existingUser.id, createUserDto);
    }
    
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {  // number에서 string으로 변경
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, updateData: Partial<CreateUserDto>): Promise<User> {  // number에서 string으로 변경
    const result = await this.userRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }
    
    return updatedUser;
  }

  async findByXId(xId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { xId } });
    return user;
  }

  async updateWalletAddress(userId: string, walletAddress: string): Promise<User> {
    console.log(`Updating wallet address for user ${userId} to ${walletAddress}`);
    
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    user.walletAddress = walletAddress;
    return this.userRepository.save(user);
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { walletAddress } });
  }
}
