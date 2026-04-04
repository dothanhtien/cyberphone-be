import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './entities';
import { IdentitiesService } from './identities.service';
import { IDENTITY_REPOSITORY, IdentityRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Identity])],
  providers: [
    IdentitiesService,
    {
      provide: IDENTITY_REPOSITORY,
      useClass: IdentityRepository,
    },
  ],
  exports: [IdentitiesService],
})
export class IdentitiesModule {}
