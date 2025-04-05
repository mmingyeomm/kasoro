import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Depositor } from './entities/depositor.entity';

@Injectable()
export class DepositorRepository extends Repository<Depositor> {
  constructor(private dataSource: DataSource) {
    super(Depositor, dataSource.createEntityManager());
  }

  async findByUserAndCommunity(userId: string, communityId: string): Promise<Depositor | null> {
    const result = await this.findOne({
      where: { 
        userId,
        communityId 
      }
    });
    
    // Ensure amount is a number
    if (result) {
      result.amount = parseFloat(result.amount.toString());
    }
    
    return result;
  }

  async findByCommunity(communityId: string): Promise<Depositor[]> {
    // Return unique depositors (grouped by user) with their total amounts
    return this.createQueryBuilder('depositor')
      .select('MAX(depositor.id)', 'id')
      .addSelect('depositor.userId', 'userId')
      .addSelect('depositor.communityId', 'communityId')
      .addSelect('depositor.walletAddress', 'walletAddress')
      .addSelect('MAX(depositor.depositedAt)', 'depositedAt')
      .addSelect('SUM(depositor.amount)', 'amount')
      .leftJoin('depositor.user', 'user')
      .addSelect('user.id', 'user_id')
      .addSelect('user.username', 'user_username')
      .addSelect('user.displayName', 'user_displayName')
      .addSelect('user.profileImageUrl', 'user_profileImageUrl')
      .where('depositor.communityId = :communityId', { communityId })
      .groupBy('depositor.userId')
      .addGroupBy('user.id')
      .addGroupBy('user.username')
      .addGroupBy('user.displayName')
      .addGroupBy('user.profileImageUrl')
      .addGroupBy('depositor.communityId')
      .addGroupBy('depositor.walletAddress')
      .orderBy('MAX(depositor.depositedAt)', 'DESC')
      .getRawMany()
      .then(results => {
        // Transform the raw results back into Depositor objects with user property
        return results.map(result => {
          const depositor = new Depositor();
          depositor.id = result.id;
          depositor.userId = result.userId;
          depositor.communityId = result.communityId;
          depositor.walletAddress = result.walletAddress;
          depositor.amount = parseFloat(result.amount);
          depositor.depositedAt = result.depositedAt;
          
          // Set the user object
          depositor.user = {
            id: result.user_id,
            username: result.user_username,
            displayName: result.user_displayName,
            profileImageUrl: result.user_profileImageUrl
          } as any;
          
          return depositor;
        });
      });
  }

  async getTotalDepositedByCommunity(communityId: string): Promise<number> {
    const result = await this.createQueryBuilder('depositor')
      .select('SUM(depositor.amount)', 'total')
      .where('depositor.communityId = :communityId', { communityId })
      .getRawOne();
    
    return result.total || 0;
  }
} 