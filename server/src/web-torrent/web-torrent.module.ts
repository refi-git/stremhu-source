import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { SettingsCoreModule } from 'src/settings/core/settings-core.module';
import { TorrentCacheCoreModule } from 'src/torrent-cache/core/torrent-cache-core.module';
import { UsersModule } from 'src/users/users.module';

import { WebTorrentRunsModule } from './runs/web-torrent-runs.module';
import { WebTorrentController } from './web-torrent.controller';
import { WebTorrentService } from './web-torrent.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WebTorrentRunsModule,
    TorrentCacheCoreModule,
    SettingsCoreModule,
  ],
  providers: [WebTorrentService],
  controllers: [WebTorrentController],
  exports: [WebTorrentService],
})
export class WebTorrentModule {}
