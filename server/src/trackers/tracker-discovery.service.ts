import {
  BadRequestException,
  HttpException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import _ from 'lodash';

import { TorrentCacheStore } from 'src/torrent-cache/core/torrent-cache.store';

import {
  AdapterParsedTorrent,
  AdapterTorrentId,
} from './adapters/adapters.types';
import { TrackerCredentialsService } from './credentials/tracker-credentials.service';
import { TrackerTorrentStatusEnum } from './enum/tracker-torrent-status.enum';
import { TrackerEnum } from './enum/tracker.enum';
import { TrackerAdapterRegistry } from './tracker-adapter.registry';
import {
  LoginRequest,
  TrackerAdapter,
  TrackerSearchQuery,
  TrackerTorrent,
  TrackerTorrentId,
} from './tracker.types';
import { LOGIN_ERROR_MESSAGE } from './trackers.constants';

@Injectable()
export class TrackerDiscoveryService {
  constructor(
    private readonly trackerAdapterRegistry: TrackerAdapterRegistry,
    private readonly trackerCredentialsService: TrackerCredentialsService,
    private readonly torrentCacheStore: TorrentCacheStore,
  ) {}

  async login(tracker: TrackerEnum, payload: LoginRequest): Promise<void> {
    try {
      const adapter = this.trackerAdapterRegistry.get(tracker);
      await adapter.login(payload);
      await this.trackerCredentialsService.create({
        tracker,
        ...payload,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.getStatus() === 422) {
          throw new BadRequestException(LOGIN_ERROR_MESSAGE);
        }

        throw error;
      }

      throw new NotImplementedException(
        `Bejelentkezés közben hiba történt, próbáld újra!`,
      );
    }
  }

  async findTorrents(query: TrackerSearchQuery): Promise<TrackerTorrent[]> {
    const credentials = await this.trackerCredentialsService.find();

    if (credentials.length === 0) {
      return [
        {
          status: TrackerTorrentStatusEnum.ERROR,
          message:
            '[StremHU | Source] Használat előtt konfigurálnod kell tracker bejelentkezést.',
        },
      ];
    }

    const results = await Promise.all(
      credentials.map((credential) => {
        const adapter = this.trackerAdapterRegistry.get(credential.tracker);
        return this.findTrackerTorrents(adapter, query);
      }),
    );

    return results.flat();
  }

  async findOneTorrent(
    tracker: TrackerEnum,
    torrentId: string,
  ): Promise<TrackerTorrentId> {
    const adapter = this.trackerAdapterRegistry.get(tracker);

    const torrent = await adapter.findOne(torrentId);
    const torrentCache = await this.torrentCacheStore.findOne(torrent);

    if (torrentCache) {
      return {
        ...torrent,
        parsed: torrentCache.parsed,
      };
    }

    const downloaded = await adapter.download(torrent);
    await this.torrentCacheStore.create({
      tracker,
      torrentId,
      imdbId: torrent.imdbId,
      parsed: downloaded.parsed,
    });

    return {
      ...torrent,
      parsed: downloaded.parsed,
    };
  }

  private async findTrackerTorrents(
    adapter: TrackerAdapter,
    query: TrackerSearchQuery,
  ): Promise<TrackerTorrent[]> {
    try {
      const { imdbId } = query;

      const torrents = await adapter.find(query);
      const cachedTorrents = await this.torrentCacheStore.find({
        imdbId,
        tracker: adapter.tracker,
      });

      const notCachedTorrents = _.differenceWith(
        torrents,
        cachedTorrents,
        (torrent, cachedTorrent) =>
          torrent.torrentId === cachedTorrent.torrentId,
      );
      const torrentParsedFiles = await this.downloads(
        adapter,
        notCachedTorrents,
      );

      const notAvailableTorrents = _.differenceWith(
        cachedTorrents,
        torrents,
        (cachedTorrent, torrent) =>
          torrent.torrentId === cachedTorrent.torrentId,
      );
      await this.torrentCacheStore.delete(
        notAvailableTorrents.map(
          (notAvailableTorrent) => notAvailableTorrent.path,
        ),
      );

      const allTorrent = [...cachedTorrents, ...torrentParsedFiles];

      const allTorrentMap = _.keyBy(allTorrent, 'torrentId');

      return torrents.map((torrent) => {
        return {
          ...torrent,
          status: TrackerTorrentStatusEnum.SUCCESS,
          parsed: allTorrentMap[torrent.torrentId].parsed,
        };
      });
    } catch (error) {
      let message = 'Hiba történt';

      if (
        _.isObject(error) &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        message = error.message;
      }

      return [
        {
          status: TrackerTorrentStatusEnum.ERROR,
          message,
        },
      ];
    }
  }

  private async downloads(
    adapter: TrackerAdapter,
    adapterTorrents: AdapterTorrentId[],
  ): Promise<AdapterParsedTorrent[]> {
    const adapterParsedTorrents: AdapterParsedTorrent[] = [];

    for (const adapterTorrent of adapterTorrents) {
      const adapterParsedTorrent = await adapter.download(adapterTorrent);
      adapterParsedTorrents.push(adapterParsedTorrent);

      await this.torrentCacheStore.create({
        imdbId: adapterTorrent.imdbId,
        parsed: adapterParsedTorrent.parsed,
        torrentId: adapterTorrent.torrentId,
        tracker: adapterTorrent.tracker,
      });
    }

    return adapterParsedTorrents;
  }
}
