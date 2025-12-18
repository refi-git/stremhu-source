import { UserRoleEnum } from '../enum/user-role.enum';

export interface UserCoreToCreate {
  username: string;
  passwordHash: string | null;
  userRole: UserRoleEnum;
  token: string;
}
