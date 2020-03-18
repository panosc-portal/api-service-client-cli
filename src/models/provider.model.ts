
export class Provider {
  id: number;
  name: string;
  description?: string;
  url: string;

  constructor(data?: Partial<Provider>) {
    Object.assign(this, data);
  }
}
