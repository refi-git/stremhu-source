import { Resolution } from '@ctrl/video-filename-parser';

import { LanguageEnum } from 'src/common/enums/language.enum';

import { UserRoleEnum } from './enums/user-role.enum';

export interface UserToCreate {
  username: string;
  password: string | null;
  userRole: UserRoleEnum;
}

export interface UserToUpdate {
  username?: string;
  password?: string | null;
  torrentResolutions?: Resolution[];
  torrentLanguages?: LanguageEnum[];
  torrentSeed?: number | null;
}
