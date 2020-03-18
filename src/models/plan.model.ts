import { Image } from './image.model';
import { Flavour } from './flavour.model';
import { Provider } from './provider.model';

export class Plan {
  id: number;
  name: string;
  description?: string;
  flavour: Flavour;
  image: Image;
  provider: Provider;

  constructor(data?: Partial<Plan>) {
    Object.assign(this, data);
  }
}
