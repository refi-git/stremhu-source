import {
  Resolution as ResolutionEnum,
  Source as SourceEnum,
  filenameParse,
} from '@ctrl/video-filename-parser';
import { Injectable } from '@nestjs/common';
import { filesize } from 'filesize';
import _ from 'lodash';

import { CatalogService } from 'src/catalog/catalog.service';
import { RESOLUTION_LABEL_MAP } from 'src/common/common.constant';
import { LanguageEnum } from 'src/common/enum/language.enum';
import { SettingsStore } from 'src/settings/core/settings.store';
import { TrackerTorrentStatusEnum } from 'src/trackers/enum/tracker-torrent-status.enum';
import { TrackerDiscoveryService } from 'src/trackers/tracker-discovery.service';
import {
  TrackerTorrentError,
  TrackerTorrentSuccess,
} from 'src/trackers/tracker.types';
import { TRACKER_INFO } from 'src/trackers/trackers.constants';
import { User } from 'src/users/entity/user.entity';

import { StreamDto } from './dto/stremio-stream.dto';
import { ParsedStreamIdSeries } from './pipe/stream-id.pipe';
import { FindStreams } from './type/find-streams.type';
import { VideoFileLanguage } from './type/video-file-language.type';
import { VideoFileResolution } from './type/video-file-resolution.type';
import { VideoFileWithRank } from './type/video-file-with-rank.type';
import { findVideoFile } from './util/find-video-file.util';
import { isNotWebReady } from './util/is-not-web-ready.util';
import { parseHdrTypes } from './util/parse-hdr-types.util';

@Injectable()
export class StreamsService {
  constructor(
    private readonly trackerDiscoveryService: TrackerDiscoveryService,
    private readonly settingsStore: SettingsStore,
    private readonly catalogService: CatalogService,
  ) {}

  async streams(payload: FindStreams): Promise<StreamDto[]> {
    const { user, mediaType, series } = payload;

    const { imdbId, originalImdbId } = await this.catalogService.resolveImdbId({
      imdbId: payload.imdbId,
      season: series?.season,
      episode: series?.episode,
    });

    const isSpecial = typeof originalImdbId === 'string';

    const endpoint = await this.settingsStore.getEndpoint();

    const torrents = await this.trackerDiscoveryService.findTorrents({
      imdbId: imdbId,
      mediaType: !isSpecial ? mediaType : undefined,
    });

    const torrentErrors: TrackerTorrentError[] = [];
    const torrentSuccesses: TrackerTorrentSuccess[] = [];

    torrents.forEach((torrent) => {
      if (torrent.status === TrackerTorrentStatusEnum.ERROR) {
        return torrentErrors.push(torrent);
      }
      return torrentSuccesses.push(torrent);
    });

    const videoFiles = this.findVideoFilesWithRank(
      user,
      isSpecial,
      torrentSuccesses,
      series,
    );
    const filteredVideoFiles = this.filterVideoFiles(videoFiles, user);
    const sortedVideoFiles = this.sortVideoFiles(filteredVideoFiles);

    const streamErrors: StreamDto[] = torrentErrors.map((torrentError) => ({
      name: '❗ H I B A ❗',
      description: `❗ ${torrentError.message} ❗`,
      url: 'http://hiba.tortent',
      behaviorHints: {
        notWebReady: false,
      },
    }));

    const streams: StreamDto[] = sortedVideoFiles.map((videoFile) => {
      const hdrTypes = videoFile.hdrTypes.join(', ');

      const nameArray = _.compact([videoFile.resolution.label, hdrTypes]);

      const isCamSource = videoFile.sources.includes(SourceEnum.CAM);

      if (isCamSource) {
        nameArray.push('📹 CAM');
      }

      const fileSize = `💾 ${filesize(videoFile.fileSize)}`;
      const seeders = `👥 ${videoFile.seeders}`;
      const tracker = `🧲 ${TRACKER_INFO[videoFile.tracker].label}`;
      const group = videoFile.group ? `🎯 ${videoFile.group}` : undefined;

      const descriptionArray = _.compact([
        _.compact([tracker, seeders]).join(' | '),
        _.compact([videoFile.language.label, videoFile.audioCodec]).join(' | '),
        _.compact([fileSize, group]).join(' | '),
      ]);

      const bingeGroup = [
        videoFile.tracker,
        videoFile.resolution.value.toLowerCase(),
        videoFile.language.value.toLowerCase(),
      ].join('-');

      return {
        name: nameArray.join(' | '),
        description: descriptionArray.join('\n'),
        url: `${endpoint}/api/${user.token}/stream/play/${videoFile.imdbId}/${videoFile.tracker}/${videoFile.torrentId}/${videoFile.fileIndex}`,
        behaviorHints: {
          notWebReady: videoFile.notWebReady,
          bingeGroup,
          filename: videoFile.fileName,
        },
      };
    });

    return [...streams, ...streamErrors];
  }

  private findVideoFilesWithRank(
    user: User,
    isSpecial: boolean,
    torrents: TrackerTorrentSuccess[],
    series?: ParsedStreamIdSeries,
  ): VideoFileWithRank[] {
    const torrentByFiles: VideoFileWithRank[] = [];

    for (const torrent of torrents) {
      const torrentName = torrent.parsed.name;
      if (!torrentName) continue;

      const {
        sources: torrentSources,
        videoCodec: torrentVideoCodec,
        resolution: torrentResolution,
        audioCodec: torrentAudioCodec,
        group: torrentGroup,
      } = filenameParse(torrentName);

      const videoFile = findVideoFile({
        files: torrent.parsed.files,
        series,
        isSpecial,
      });

      if (!videoFile) continue;

      const {
        sources: fileSources,
        videoCodec: fileVideoCodec,
        resolution: fileResolution,
        audioCodec: fileAudioCodec,
      } = filenameParse(videoFile.file.name);

      const videoCodec = torrentVideoCodec ?? fileVideoCodec;
      const resolution = torrentResolution ?? fileResolution;
      const audioCodec = torrentAudioCodec ?? fileAudioCodec;
      const sources = torrentSources ?? fileSources;

      const torrentByFile: VideoFileWithRank = {
        imdbId: torrent.imdbId,
        tracker: torrent.tracker,
        torrentId: torrent.torrentId,
        seeders: torrent.seeders,
        group: torrentGroup || undefined,

        infoHash: torrent.parsed.infoHash,
        fileName: videoFile.file.name,
        fileSize: videoFile.file.length,
        fileIndex: videoFile.fileIndex,

        language: this.toLanguageInfo(torrent.language, user),
        resolution: this.toResolutionInfo(
          resolution || torrent.resolution,
          user,
        ),
        audioCodec,
        videoCodec,
        hdrTypes: parseHdrTypes(torrentName),
        sources,
        notWebReady: isNotWebReady(videoCodec, audioCodec),
      };

      torrentByFiles.push(torrentByFile);
    }

    return torrentByFiles;
  }

  private sortVideoFiles(videoFiles: VideoFileWithRank[]): VideoFileWithRank[] {
    const sortedVideoFiles = _.orderBy(
      videoFiles,
      [
        (videoFile) => videoFile.language.rank,
        (videoFile) => videoFile.resolution.rank,
        (videoFile) => videoFile.seeders,
      ],
      ['asc', 'asc', 'desc'],
    );

    return sortedVideoFiles;
  }

  private filterVideoFiles(
    videoFiles: VideoFileWithRank[],
    user: User,
  ): VideoFileWithRank[] {
    const { torrentLanguages, torrentResolutions, torrentSeed } = user;

    const filteredVideoFiles = videoFiles.filter((videoFile) => {
      const isLanguageSet = torrentLanguages.includes(videoFile.language.value);

      const isResolutionSet = torrentResolutions.includes(
        videoFile.resolution.value,
      );

      let isSeedSet = true;

      if (torrentSeed !== null) {
        isSeedSet = videoFile.seeders > torrentSeed;
      }

      return isLanguageSet && isResolutionSet && isSeedSet;
    });

    return filteredVideoFiles;
  }

  private toLanguageInfo(
    language: LanguageEnum,
    user: User,
  ): VideoFileLanguage {
    const index = user.torrentLanguages.indexOf(language);

    let rank: number | undefined = undefined;
    if (index !== -1) {
      rank = index + 1;
    }

    const videoFileLanguage: VideoFileLanguage = {
      label: '🌍 magyar',
      rank: rank || 91,
      value: language,
    };

    if (language !== LanguageEnum.HU) {
      videoFileLanguage.label = '🌍 english';
      videoFileLanguage.rank = rank || 92;
    }

    return videoFileLanguage;
  }

  private toResolutionInfo(
    resolution: ResolutionEnum,
    user: User,
  ): VideoFileResolution {
    const resolutionIndex = user.torrentResolutions.indexOf(resolution);

    let resolutionRank: number | undefined = undefined;
    if (resolutionIndex !== -1) {
      resolutionRank = resolutionIndex + 1;
    }

    switch (resolution) {
      case ResolutionEnum.R2160P:
        return {
          label: RESOLUTION_LABEL_MAP[resolution],
          value: resolution,
          rank: resolutionRank || 91,
        };
      case ResolutionEnum.R1080P:
        return {
          label: RESOLUTION_LABEL_MAP[resolution],
          value: resolution,
          rank: resolutionRank || 92,
        };
      case ResolutionEnum.R720P:
        return {
          label: RESOLUTION_LABEL_MAP[resolution],
          value: resolution,
          rank: resolutionRank || 93,
        };
      case ResolutionEnum.R576P:
        return {
          label: RESOLUTION_LABEL_MAP[resolution],
          value: resolution,
          rank: resolutionRank || 94,
        };
      case ResolutionEnum.R540P:
        return {
          label: RESOLUTION_LABEL_MAP[resolution],
          value: resolution,
          rank: resolutionRank || 95,
        };
      case ResolutionEnum.R480P:
        return {
          label: RESOLUTION_LABEL_MAP[resolution],
          value: resolution,
          rank: resolutionRank || 96,
        };
    }
  }
}
