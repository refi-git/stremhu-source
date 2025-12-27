import { SourceTypeEnum } from '../enum/source-type.enum';

type HdrType =
  | SourceTypeEnum.DISC_REMUX
  | SourceTypeEnum.DISC_RIP
  | SourceTypeEnum.WEB_DL
  | SourceTypeEnum.WEB_RIP
  | SourceTypeEnum.BROADCAST
  | SourceTypeEnum.THEATRICAL;

const SOURCE_TYPE_PATTERNS: Record<HdrType, string[]> = {
  [SourceTypeEnum.DISC_REMUX]: ['.remux.'],
  [SourceTypeEnum.DISC_RIP]: ['.bluray.', '.bdrip.', '.dvdrip.'],
  [SourceTypeEnum.WEB_DL]: ['.web-dl.', '.web_dl.', '.web-dl-rip.'],
  [SourceTypeEnum.WEB_RIP]: ['.webrip.'],
  [SourceTypeEnum.BROADCAST]: ['.hdtv.', '.pdtv.', '.dvb.', '.satrip.'],
  [SourceTypeEnum.THEATRICAL]: ['.cam.', '.ts.', '.tc.'],
};

export function parseSourceType(torrentName: string): SourceTypeEnum {
  const normalizedTorrentName = torrentName.toLocaleLowerCase();

  let sourceType = SourceTypeEnum.UNKNOWN;

  for (const [type, patterns] of Object.entries(SOURCE_TYPE_PATTERNS)) {
    const isSourceType = patterns.some((pattern) =>
      normalizedTorrentName.includes(pattern),
    );

    if (!isSourceType) {
      continue;
    }

    sourceType = type as SourceTypeEnum;
    break;
  }

  return sourceType;
}
