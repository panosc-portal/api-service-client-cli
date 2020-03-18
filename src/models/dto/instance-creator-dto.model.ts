export class InstanceCreatorDto {
  name: string;
  description?: string;
  planId: number;

  constructor(data?: Partial<InstanceCreatorDto>) {
    Object.assign(this, data);
  }
}
