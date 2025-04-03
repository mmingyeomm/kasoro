import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  xId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ nullable: true })
  walletAddress: string;

  @Column({ nullable: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 