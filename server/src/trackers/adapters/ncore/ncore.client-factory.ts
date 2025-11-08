import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AxiosInstance } from 'axios';
import { AxiosError, AxiosHeaders } from 'axios';
import { load } from 'cheerio';
import _ from 'lodash';
import { CookieJar } from 'tough-cookie';

import { createAxios } from 'src/trackers/common/create-axios';
import { TrackerCredentialsService } from 'src/trackers/credentials/tracker-credentials.service';
import { TrackerEnum } from 'src/trackers/enums/tracker.enum';

import { NCORE_LOGIN_PATH } from './ncore.constants';
import { NcoreLoginRequest } from './ncore.types';

@Injectable()
export class NcoreClientFactory {
  private readonly logger = new Logger(NcoreClientFactory.name);
  private readonly ncoreBaseUrl: string;

  private jar = new CookieJar();
  private axios: AxiosInstance = createAxios(this.jar);
  private loginInProgress: Promise<void> | null = null;

  constructor(
    private configService: ConfigService,
    private trackerCredentialsService: TrackerCredentialsService,
  ) {
    this.ncoreBaseUrl =
      this.configService.getOrThrow<string>('tracker.ncore-url');

    this.initInterceptors();
  }

  get client(): AxiosInstance {
    return this.axios;
  }

  async login(payload: NcoreLoginRequest) {
    const { username, password } = payload;

    const url = new URL(NCORE_LOGIN_PATH, this.ncoreBaseUrl).toString();

    const form = new URLSearchParams();
    form.set('nev', username);
    form.set('pass', password);
    form.set('submitted', '1');

    await this.axios.post(url, form, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: url,
      },
    });
  }

  private initInterceptors() {
    this.axios.interceptors.response.use(
      async (res) => {
        const requestPath = _.get(res.request, ['path']) as string | undefined;
        const isLoginPath = requestPath?.includes('login.php');

        let hasLoginForm = false;

        if (typeof res.data === 'string') {
          const $ = load(res.data);
          const hasUsername = $('input[name="nev"]').length > 0;
          const hasPassword = $('input[name="pass"]').length > 0;
          hasLoginForm = hasUsername && hasPassword;
        }

        if (isLoginPath || hasLoginForm) {
          if (res.config._retry) {
            throw new ForbiddenException(
              'nCore hitelesítése információkat frissíteni kell',
            );
          }

          await this.relogin();

          if (res.config.headers) {
            const headers = AxiosHeaders.from(res.config.headers);
            headers.delete('cookie');
            res.config.headers = headers;
          }

          res.config._retry = true;

          return this.axios.request(res.config);
        }

        return res;
      },
      async (error: AxiosError) => {
        const { response, config } = error;

        const sessionExpired =
          response?.status === 401 || response?.status === 403;

        if (!sessionExpired || !config || config._retry) {
          return Promise.reject(error);
        }

        await this.relogin();

        config._retry = true;

        return this.axios.request(config);
      },
    );
  }

  private async relogin() {
    if (this.loginInProgress) {
      return this.loginInProgress;
    }

    this.loginInProgress = this.doRelogin();

    try {
      await this.loginInProgress;
    } finally {
      this.loginInProgress = null;
    }

    return this.loginInProgress;
  }

  private async doRelogin() {
    this.logger.log('🔄 nCore session frissítése');

    const credential = await this.trackerCredentialsService.findOne(
      TrackerEnum.NCORE,
    );

    if (!credential) {
      throw new ForbiddenException(
        'nCore hitelesítése információk nincsenek megadva',
      );
    }

    await this.login(credential);
  }
}
