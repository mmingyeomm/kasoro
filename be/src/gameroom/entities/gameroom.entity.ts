import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../message/entities/message.entity';

@Entity()
export class GameRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @OneToMany(() => Message, message => message.gameRoom)
  messages: Message[];

  @Column({ nullable: true })
  contractAddress: string; 

  @Column({ nullable: true })
  bountyAmount: number;

  @Column({ nullable: true })
  timeLimit: number;

  @Column({ nullable: true })
  baseFeePercentage: number;
  
  @Column({ nullable: true })
  walletAddress: string;
}
