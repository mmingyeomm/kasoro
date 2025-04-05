import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Community } from './community.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('depositors')
export class Depositor {
  @ApiProperty({ description: 'Unique identifier for the deposit' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the user who made the deposit' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'User who made the deposit', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'ID of the community the deposit was made to' })
  @Column()
  communityId: string;

  @ApiProperty({ description: 'Community the deposit was made to', type: () => Community })
  @ManyToOne(() => Community)
  @JoinColumn({ name: 'communityId' })
  community: Community;

  @ApiProperty({ description: 'Amount deposited in SOL' })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Wallet address used for deposit' })
  @Column()
  walletAddress: string;

  @ApiProperty({ description: 'Timestamp of when the deposit was made' })
  @CreateDateColumn()
  depositedAt: Date;
  
  // Ensure amount is always treated as a number
  @BeforeInsert()
  @BeforeUpdate()
  normalizeAmount() {
    if (this.amount) {
      this.amount = parseFloat(this.amount.toString());
    }
  }
} 