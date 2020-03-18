export class AuthorisationToken {
  token: string;

  constructor(data?: Partial<AuthorisationToken>) {
    Object.assign(this, data);
  }
}