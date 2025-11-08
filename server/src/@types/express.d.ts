import { Request } from 'express';

import { User } from 'src/users/entities/user.entity';

declare module 'express' {
  export interface Request {
    user?: User | null;
  }
}
