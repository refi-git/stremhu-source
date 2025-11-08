import { Module } from '@nestjs/common';

import { TorrentCacheStore } from './torrent-cache.store';

@Module({
  providers: [TorrentCacheStore],
  exports: [TorrentCacheStore],
})
export class TorrentCacheCoreModule {}
