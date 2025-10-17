// test/authentication.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../../src/authentication/authentication.controller';
import { AuthenticationService } from '../../src/authentication/authentication.service';
import { SignInDto } from '../../src/authentication/dtos/signin.dto';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authService: AuthenticationService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn().mockResolvedValue({ access_token: 'fake-token' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [{ provide: AuthenticationService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    authService = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should call authService.login and return token', async () => {
    const dto: SignInDto = { username: 'user', password: 'pass' } as any;
    const result = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ access_token: 'fake-token' });
  });
});
