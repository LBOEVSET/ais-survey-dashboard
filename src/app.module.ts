import { Module } from '@nestjs/common';
import { UserRatingModule } from './database/userrating.module';
import { DBSVTModule } from './dbsvt.module';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { FrameworkModule } from '@eqxjs/stub';
import { MetricsModule } from './prometheus/prometheus.module';
import { LoggerModule } from './loggers/logger.module';
import { JwtModule } from '@nestjs/jwt';
import { ApplicationConfig } from 'assets/config/configuration';
import { AuthenticationModule } from './authentication/authentication.module';

@Module({
  imports: [
    FrameworkModule.register({
      configPath: join(process.cwd(), 'assets', 'config'),
      zone: ApplicationConfig.environment.zone,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: ApplicationConfig.token.jwt_secret, //cfg.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: ApplicationConfig.token.jwt_expires }, //{ expiresIn: cfg.get<string>('JWT_EXPIRES') ?? '1h' },
      }),
    }),
    DBSVTModule,
    UserRatingModule,
    MetricsModule,
    LoggerModule,
    AuthenticationModule
  ],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: AppInterceptor,
    // },
  ],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {
  // console.log("ZONE",process.env)
  }
}
