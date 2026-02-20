import jwt, { type SignOptions } from 'jsonwebtoken';
import type { ReqResClientPort } from '../ports/ReqResClientPort.js';

export interface LoginResult {
  token: string;
}

const sign = (jwt as { sign?: typeof jwt.sign; default?: { sign: typeof jwt.sign } }).default?.sign ?? jwt.sign;

export class LoginUseCase {
  constructor(
    private readonly reqRes: ReqResClientPort,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string
  ) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    await this.reqRes.login(email, password);
    const token = sign(
      { sub: email },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn } as SignOptions
    );
    return { token };
  }
}
