import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrackerCredential } from './entities/tracker-credential.entity';
import { TrackerCredentialsService } from './tracker-credentials.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrackerCredential])],
  providers: [TrackerCredentialsService],
  exports: [TrackerCredentialsService],
})
export class TrackerCredentialsModule {}
