import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { GameRoom } from '../../gameroom/entities/gameroom.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

    @Column()
    userId: string;

  @ManyToOne(() => GameRoom, gameRoom => gameRoom.messages)
  @JoinColumn({ name: 'gameRoomId' })
  gameRoom: GameRoom;

  @Column()
  gameRoomId: string;
}
