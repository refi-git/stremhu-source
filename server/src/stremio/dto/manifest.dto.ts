import { ApiProperty } from '@nestjs/swagger';

export enum ContentTypeEnum {
  MOVIE = 'movie',
  SERIES = 'series',
  CHANNEL = 'channel',
  TV = 'tv',
}
export enum ExtraEnum {
  SEARCH = 'search',
  GENRE = 'genre',
  SKIP = 'skip',
}
export enum ShortManifestResourceEnum {
  CATALOG = 'catalog',
  META = 'meta',
  SRTEAM = 'stream',
  SUBTITLES = 'subtitles',
  ADDON_CATALOG = 'addon_catalog',
}

export enum ManifestConfigTypeEnum {
  TEXT = 'text',
  NUMBER = 'number',
  PASSWORD = 'password',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
}

export class ManifestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  version: string;

  @ApiProperty({
    type: Array<ShortManifestResourceEnum | FullManifestResource>,
  })
  resources: Array<ShortManifestResourceEnum | FullManifestResource>;

  @ApiProperty({ enum: ContentTypeEnum, isArray: true })
  types: ContentTypeEnum[];

  @ApiProperty()
  idPrefixes?: string[] | undefined;

  @ApiProperty()
  catalogs: ManifestCatalog[];

  @ApiProperty()
  addonCatalogs?: ManifestCatalog[] | undefined;

  @ApiProperty()
  config?: ManifestConfig[];

  @ApiProperty()
  background?: string | undefined;

  @ApiProperty()
  logo?: string | undefined;

  @ApiProperty()
  contactEmail?: string | undefined;
  behaviorHints?: BehaviorHint | undefined;
}

export class BehaviorHint {
  @ApiProperty()
  adult?: boolean | undefined;

  @ApiProperty()
  p2p?: boolean | undefined;

  @ApiProperty()
  configurable?: boolean;

  @ApiProperty()
  configurationRequired?: boolean;
}

export class FullManifestResource {
  @ApiProperty({ enum: ShortManifestResourceEnum })
  name: ShortManifestResourceEnum;

  @ApiProperty({ enum: ContentTypeEnum, isArray: true })
  types: ContentTypeEnum[];

  @ApiProperty()
  idPrefixes?: string[] | undefined;
}

export class ManifestExtra {
  @ApiProperty({ enum: ExtraEnum })
  name: ExtraEnum;

  @ApiProperty()
  isRequired?: boolean | undefined;

  @ApiProperty()
  options?: string[] | undefined;

  @ApiProperty()
  optionsLimit?: number | undefined;
}

export class ManifestCatalog {
  @ApiProperty({ enum: ContentTypeEnum })
  type: ContentTypeEnum;

  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: ManifestExtra, isArray: true })
  extra?: ManifestExtra[] | undefined;
}

export class ManifestConfig {
  @ApiProperty()
  key: string;

  @ApiProperty({ enum: ManifestConfigTypeEnum })
  type: ManifestConfigTypeEnum;

  @ApiProperty()
  default?: string;

  @ApiProperty()
  title?: string;

  @ApiProperty()
  options?: string[];

  @ApiProperty()
  required?: string;
}
