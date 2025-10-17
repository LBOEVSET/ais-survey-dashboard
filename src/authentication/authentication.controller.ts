import { Body, Controller, HttpCode, HttpStatus, Post, Version } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Public } from "../common/decorators";
import { SignInDto } from "./dtos/signin.dto"

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly auth: AuthenticationService) {}

  @Public()
  @Version('1')
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: SignInDto) {
    return this.auth.login(dto);
  }
}
