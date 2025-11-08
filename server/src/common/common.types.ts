import { UserRoleEnum } from 'src/users/enums/user-role.enum';

import { LanguageEnum } from './enums/language.enum';
import { ResolutionEnum } from './enums/resolution.enum';

export interface UserRoleOption {
  value: UserRoleEnum;
  label: string;
}

export interface ResolutionOption {
  value: ResolutionEnum;
  label: string;
}

export interface LanguageOption {
  value: LanguageEnum;
  label: string;
}
