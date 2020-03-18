export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}
