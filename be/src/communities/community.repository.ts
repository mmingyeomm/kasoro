import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { Logger } from '@nestjs/common';
import { OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class CommunityRepository extends Repository<Community> implements OnApplicationBootstrap {
  private readonly logger = new Logger(CommunityRepository.name);

  constructor(private dataSource: DataSource) {
    super(Community, dataSource.createEntityManager());
  }

  async onApplicationBootstrap() {
    // Log entity metadata to verify column existence
    const metadata = this.manager.connection.getMetadata(Community);
    this.logger.log(`Community entity columns: ${metadata.columns.map(col => col.propertyName).join(', ')}`);
    
    // Specifically check for lastMessageTime column
    const hasLastMessageTimeColumn = metadata.columns.some(
      col => col.propertyName === 'lastMessageTime'
    );
    
    this.logger.log(`lastMessageTime column exists: ${hasLastMessageTimeColumn}`);
  }

  async updateLastMessageTime(id: string, timestamp: Date): Promise<void> {
    await this.update(id, { lastMessageTime: timestamp });
  }
}