import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { SettingsCoreModule } from 'src/settings/core/settings-core.module';
import { TorrentCacheCoreModule } from 'src/torrent-cache/core/torrent-cache-core.module';
import { UsersModule } from 'src/users/users.module';
import { WebTorrentModule } from 'src/web-torrent/web-torrent.module';

import { NcoreAdapter } from './adapters/ncore/ncore.adapter';
import { NcoreClient } from './adapters/ncore/ncore.client';
import { NcoreClientFactory } from './adapters/ncore/ncore.client-factory';
import { TrackerCredentialsModule } from './credentials/tracker-credentials.module';
import { TrackersController } from './trackers.controller';
import { TrackersService } from './trackers.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TrackerCredentialsModule,
    TorrentCacheCoreModule,
    WebTorrentModule,
    SettingsCoreModule,
  ],
  providers: [TrackersService, NcoreAdapter, NcoreClient, NcoreClientFactory],
  controllers: [TrackersController],
  exports: [TrackersService],
})
export class TrackersModule {}
