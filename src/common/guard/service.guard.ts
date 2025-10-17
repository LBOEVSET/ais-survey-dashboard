import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ServiceGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const accessToken = ctx.switchToHttp().getRequest().header('access_token');
    
    if (!accessToken) {
      throw new UnauthorizedException('Missing accessToken');
    }
    return true;
  }
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    return true;
  }
}
