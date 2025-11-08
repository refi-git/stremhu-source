import { Module } from '@nestjs/common';

import { SettingsCoreModule } from 'src/settings/core/settings-core.module';
import { WebTorrentModule } from 'src/web-torrent/web-torrent.module';

import { TorrentCacheCoreModule } from './core/torrent-cache-core.module';
import { TorrentCacheService } from './torrent-cache.service';

@Module({
  imports: [TorrentCacheCoreModule, SettingsCoreModule, WebTorrentModule],
  providers: [TorrentCacheService],
  exports: [TorrentCacheService],
})
export class TorrentCacheModule {}
