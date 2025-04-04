import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../message/entities/message.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
export class GameRoom {
  @ApiProperty({
    description: 'Unique identifier for the game room',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the game room',
    example: 'Crypto Enthusiasts'
  })
  @Column()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the game room',
    example: 'A community for crypto discussions'
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    description: 'Creation date and time',
    example: '2023-04-01T12:00:00Z'
  })
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    description: 'User who created the game room'
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ApiProperty({
    description: 'Messages in the game room',
    type: () => [Message]
  })
  @OneToMany(() => Message, message => message.gameRoom)
  messages: Message[];

  @ApiPropertyOptional({
    description: 'Smart contract address for the game room',
    example: '0x123abc456def789ghi'
  })
  @Column({ nullable: true })
  contractAddress: string; 

  @ApiPropertyOptional({
    description: 'Bounty amount in SOL',
    example: 1.5
  })
  @Column({ nullable: true })
  bountyAmount: number;

  @ApiPropertyOptional({
    description: 'Time limit in minutes',
    example: 30
  })
  @Column({ nullable: true })
  timeLimit: number;

  @ApiPropertyOptional({
    description: 'Base fee percentage',
    example: 5
  })
  @Column({ nullable: true })
  baseFeePercentage: number;
  
  @ApiPropertyOptional({
    description: 'Wallet address',
    example: '0x987zyx654wvu321tsr'
  })
  @Column({ nullable: true })
  walletAddress: string;

  @ApiPropertyOptional({
    description: 'Timestamp of the last message posted in this game room',
    example: '2023-04-01T14:30:00Z'
  })
  @Column({ nullable: true, type: 'timestamp' })
  lastMessageTime: Date;
}
