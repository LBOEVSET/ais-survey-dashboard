import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(private readonly jwt: JwtService) {}

  private sign(payload: Record<string, any>) {
    return this.jwt.sign(payload);
  }

  async login(username: string, password: string): Promise<{ access_token: string }> {
    if (username !== 'admin' || password !== 'admin') {
      throw new UnauthorizedException('Invalid credentials');
    }
    const access_token = await this.sign({ sub: 'user-1', username, role: 'admin' });
    return { access_token };
  }
}
