import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { WebTorrentModule } from 'src/clients/webtorrent/webtorrent.module';
import { WebTorrentService } from 'src/clients/webtorrent/webtorrent.service';
import { TorrentCacheCoreModule } from 'src/torrent-cache/core/torrent-cache-core.module';
import { UsersModule } from 'src/users/users.module';

import { TorrentsController } from './torrents.controller';
import { TorrentsService } from './torrents.service';

@Module({
  imports: [AuthModule, UsersModule, WebTorrentModule, TorrentCacheCoreModule],
  providers: [
    TorrentsService,
    { provide: 'TorrentClient', useExisting: WebTorrentService },
  ],
  controllers: [TorrentsController],
  exports: [TorrentsService],
})
export class TorrentsModule {}
