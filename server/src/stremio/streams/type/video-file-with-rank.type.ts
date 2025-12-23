import {
  Source as SourceEnum,
  VideoCodec as VideoCodecEnum,
} from '@ctrl/video-filename-parser';

import { TrackerEnum } from 'src/trackers/enum/tracker.enum';

import { AudioCodecEnum } from '../enum/audio-codec.enum';
import { VideoFileLanguage } from './video-file-language.type';
import { VideoFileResolution } from './video-file-resolution.type';

export type VideoFileWithRank = {
  imdbId: string;
  tracker: TrackerEnum;
  torrentId: string;
  seeders: number;
  group?: string;

  infoHash: string;
  fileName: string;
  fileSize: number;
  fileIndex: number;

  resolution: VideoFileResolution;
  language: VideoFileLanguage;
  videoCodec?: VideoCodecEnum;
  audioCodec?: AudioCodecEnum;
  hdrTypes: string[];
  sources: SourceEnum[];
  notWebReady: boolean;
};
