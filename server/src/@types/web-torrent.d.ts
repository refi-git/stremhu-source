import 'webtorrent';

declare module 'webtorrent' {
  interface Options {
    torrentPort?: number;
  }
}
