import type { CookieJar } from 'tough-cookie';

declare module 'axios' {
  interface AxiosRequestConfig {
    jar?: CookieJar;
  }
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}
