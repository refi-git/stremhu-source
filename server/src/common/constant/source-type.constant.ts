import { SourceTypeEnum } from 'src/stremio/streams/enum/source-type.enum';

import { SourceTypeOption } from '../type/source-type-option.type';

export const SOURCE_TYPE_OPTIONS: SourceTypeOption[] = [
  { value: SourceTypeEnum.REMUX, label: 'BluRay (Remux)' },
  { value: SourceTypeEnum.WEB_DL, label: 'Streaming (WEB-DL)' },
  { value: SourceTypeEnum.RIP, label: 'Tömörített (*Rip)' },
  { value: SourceTypeEnum.HDTV, label: 'TV-ből (HDTV)' },
  { value: SourceTypeEnum.CAM, label: 'Mozis (CAM, TS, TC)' },
  { value: SourceTypeEnum.UNKNOWN, label: 'Ismeretlen' },
];

export const SOURCE_TYPE_LABEL_MAP = SOURCE_TYPE_OPTIONS.reduce(
  (previousValue, value) => ({
    ...previousValue,
    [value.value]: value.label,
  }),
  {} as Record<SourceTypeEnum, string>,
);
