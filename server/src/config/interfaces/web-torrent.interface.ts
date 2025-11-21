export interface WebTorrentConfig {
  port: number;
  'downloads-dir': string;
  'torrents-dir': string;
  'peer-limit': number;
  'store-cache-slots': number;
}
