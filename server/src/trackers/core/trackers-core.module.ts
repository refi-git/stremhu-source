import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrackerCredential } from '../credentials/entity/tracker-credential.entity';
import { TrackerStore } from './trackers.store';

@Module({
  imports: [TypeOrmModule.forFeature([TrackerCredential])],
  providers: [TrackerStore],
  exports: [TrackerStore],
})
export class TrackersCoreModule {}
