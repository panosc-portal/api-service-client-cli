import { ImageProtocol } from './image-protocol.model';

export class Image {
  id: number;
  name: string;
  environmentType: string;
  description?: string;
  protocols: ImageProtocol[];

  constructor(data?: Partial<Image>) {
    Object.assign(this, data);
  }
}