import { Role } from './role.model';

export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  activated: boolean;
  lastSeenAt: Date;
  roles: Role[];

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}
