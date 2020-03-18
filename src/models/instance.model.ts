import { Protocol } from './protocol.model';
import { Flavour } from './flavour.model';
import { Image } from './image.model';
import { Plan } from './plan.model';
import { InstanceState } from './instance-state.model';
import { InstanceMember } from './instance-member.model';

export class Instance {
  id: number;
  cloudId: number;
  name: string;
  description: string;
  createdAt: Date;
  hostname: string;
  protocols: Protocol[];
  flavour: Flavour;
  image: Image;
  plan: Plan;
  state: InstanceState;
  members: InstanceMember[];

  constructor(data?: Partial<Instance>) {
    Object.assign(this, data);
  }
}
