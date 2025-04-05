import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../message/entities/message.entity';
import { Depositor } from './depositor.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('communities')
export class Community {
  @ApiProperty({ description: 'Unique identifier for the community' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the community' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Description of the community', required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'Creation date of the community' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'ID of the user who created the community' })
  @Column()
  creatorId: string;

  @ApiProperty({ description: 'User who created the community', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @ApiProperty({ 
    description: 'Messages in the community', 
    type: () => [Message], 
    required: false 
  })
  @OneToMany(() => Message, message => message.community)
  messages: Message[];

  @ApiProperty({ 
    description: 'Depositors who contributed to the community bounty',
    type: () => [Depositor],
    required: false
  })
  @OneToMany(() => Depositor, depositor => depositor.community)
  depositors: Depositor[];

  @ApiProperty({ 
    description: 'Timestamp of the last message in the community',
    required: false
  })
  @Column({ 
    name: 'lastMessageTime',
    nullable: true, 
    type: 'timestamp',
    default: null
  })
  lastMessageTime: Date;

  @ApiPropertyOptional({
    description: 'Smart contract address for the community',
    example: '0x123abc456def789ghi'
  })
  @Column({ nullable: true })
  contractAddress: string; 

  @ApiPropertyOptional({
    description: 'Bounty amount in SOL',
    example: 1.5
  })
  @Column('decimal', { precision: 10, scale: 2, nullable: true, default: 0 })
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

  @BeforeInsert()
  @BeforeUpdate()
  normalizeBountyAmount() {
    if (this.bountyAmount !== undefined && this.bountyAmount !== null) {
      this.bountyAmount = parseFloat(this.bountyAmount.toString());
    }
  }
}
