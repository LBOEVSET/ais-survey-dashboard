import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationResponse } from './types/authentication.type';
import { SignInDto } from './dtos/signin.dto';

@Injectable()
export class AuthenticationService {
  constructor(private readonly jwt: JwtService) {}

  private sign(payload: Record<string, any>) {
    return this.jwt.sign(payload);
  }

  async login(dto: SignInDto): Promise<AuthenticationResponse> {
    if (dto.username !== 'admin' || dto.password !== 'admin') {
      throw new UnauthorizedException('Invalid credentials');
    }
    const access_token = this.sign({ sub: 'user-1', username: dto.username, role: 'admin' });
    return { access_token };
  }
}
