import { SourceTypeEnum } from '../enum/source-type.enum';

type HdrType =
  | SourceTypeEnum.REMUX
  | SourceTypeEnum.WEB_DL
  | SourceTypeEnum.RIP
  | SourceTypeEnum.HDTV
  | SourceTypeEnum.CAM;

const SOURCE_TYPE_PATTERNS: Record<HdrType, string[]> = {
  [SourceTypeEnum.REMUX]: ['.remux.'],
  [SourceTypeEnum.WEB_DL]: ['.web-dl.', '.web_dl.', '.web-dl-rip.'],
  [SourceTypeEnum.RIP]: ['.webrip.', '.bluray.', '.bdrip.', '.dvdrip.'],
  [SourceTypeEnum.HDTV]: ['.hdtv.'],
  [SourceTypeEnum.CAM]: ['.cam.', '.ts.', '.tc.'],
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
