import { User } from './user.model';

export class InstanceMember {
  id: number;
  user: User;
  instanceId: number;
  role: string;

  constructor(data?: Partial<InstanceMember>) {
    Object.assign(this, data);
  }
}
