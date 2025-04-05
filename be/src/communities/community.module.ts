import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityRepository } from './community.repository';
import { DepositorRepository } from './depositor.repository';
import { CommunityGateway } from './community.gateway';
import { Community } from './entities/community.entity';
import { Depositor } from './entities/depositor.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community, Depositor]),
    forwardRef(() => UserModule)
  ],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRepository, DepositorRepository, CommunityGateway],
  exports: [CommunityService, CommunityGateway]
})
export class CommunityModule {}
