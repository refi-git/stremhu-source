import type { AxiosInstance } from 'axios';

declare module 'axios-cookiejar-support' {
  export function wrapper<T extends AxiosInstance>(client: T): T;
}
