import { ParsedFilename, Resolution } from '@ctrl/video-filename-parser';

import { LanguageEnum } from 'src/common/enums/language.enum';
import { ParsedFile } from 'src/common/utils/parse-torrent.util';
import { TrackerEnum } from 'src/trackers/enums/tracker.enum';
import { User } from 'src/users/entities/user.entity';

import { StreamMediaTypeEnum } from '../enums/stream-media-type.enum';
import { ParsedStreamIdSeries } from './pipe/stream-id.pipe';

export enum RangeErrorEnum {
  RANGE_NOT_DEFINED = 'range-not-defined',
  RANGE_NOT_SATISFIABLE = 'range-not-satisfiable',
  RANGE_MALFORMED = 'range-malformed',
}

export interface CalculateRange {
  rangeHeader?: string;
  total: number;
  torrentPieceLength: number;
}

export interface CalculatedRangeDetails {
  start: number;
  end: number;
  contentLength: number;
}

export type CalculatedRange = CalculatedRangeDetails | RangeErrorEnum;

export type AudioCodec = ParsedFilename['audioCodec'];

export interface VideoFileResolution {
  label: string;
  value: Resolution;
  rank: number;
}

export interface VideoFileLanguage {
  emoji: string;
  label: string;
  value: LanguageEnum;
  rank: number;
}

export interface VideoFileWithRank {
  imdbId: string;
  tracker: TrackerEnum;
  torrentId: string;
  seeders: number;

  infoHash: string;
  fileName: string;
  fileSize: number;
  fileIndex: number;

  resolution: VideoFileResolution;
  language: VideoFileLanguage;
  audio?: AudioCodec;
}

export interface FindStreams {
  user: User;
  mediaType: StreamMediaTypeEnum;
  imdbId: string;
  series?: ParsedStreamIdSeries;
}

export interface PlayStream {
  imdbId: string;
  tracker: TrackerEnum;
  torrentId: string;
  fileIdx: number;
}

export interface SelectVideoOptions {
  files: ParsedFile[] | undefined;
  series?: ParsedStreamIdSeries;
}

export interface SelectedVideoFile {
  fileIndex: number;
  file: ParsedFile;
}
