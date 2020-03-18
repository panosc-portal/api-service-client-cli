
export class Protocol {
  name: string;
  port: number;

  constructor(data?: Partial<Protocol>) {
    Object.assign(this, data);
  }
}
