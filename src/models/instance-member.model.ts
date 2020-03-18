import { Image } from './image.model';
import { Flavour } from './flavour.model';
import { Provider } from './provider.model';
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
