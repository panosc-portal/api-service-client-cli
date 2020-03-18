import { Protocol } from './protocol.model';

export class ImageProtocol {
  port: number;
  protocol: Protocol;

  constructor(data?: Partial<ImageProtocol>) {
    Object.assign(this, data);
  }
}
