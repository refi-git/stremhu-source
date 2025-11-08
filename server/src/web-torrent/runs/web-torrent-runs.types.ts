import { TrackerEnum } from 'src/trackers/enums/tracker.enum';

export interface WebTorrentRunToCreate {
  tracker: TrackerEnum;
  torrentId: string;
  infoHash: string;
  imdbId: string;
}
