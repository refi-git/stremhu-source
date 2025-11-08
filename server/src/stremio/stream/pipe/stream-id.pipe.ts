import { Injectable, PipeTransform } from '@nestjs/common';
import { isString, toInteger } from 'lodash';

export interface ParsedStreamIdSeries {
  season: number;
  episode: number;
}

export interface ParsedStreamId {
  imdbId: string;
  series?: ParsedStreamIdSeries;
}

@Injectable()
export class StreamIdPipe implements PipeTransform<string, ParsedStreamId> {
  transform(value: string): ParsedStreamId {
    const parts = value.split(':');
    const [imdb, seasonPart, episodePart] = parts;

    let season: number | undefined;
    if (isString(seasonPart)) {
      season = toInteger(seasonPart);
    }

    let episode: number | undefined;
    if (isString(episodePart)) {
      episode = toInteger(episodePart);
    }

    let series: ParsedStreamIdSeries | undefined;

    if (season !== undefined && episode !== undefined) {
      series = { season, episode };
    }

    return { imdbId: imdb, series };
  }
}
