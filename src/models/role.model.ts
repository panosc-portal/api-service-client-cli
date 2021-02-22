export class Role {
  id: number;
  name: string;
  description: string;

  constructor(data?: Partial<Role>) {
    Object.assign(this, data);
  }
}
