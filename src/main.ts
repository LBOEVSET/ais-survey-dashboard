import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";
import { ClassSerializerInterceptor, VersioningType, ValidationPipe } from "@nestjs/common";
import { ExceptionsFilterInternalError } from "./common/filters/exception-internal-filter";
import { HttpExceptionFilter } from "./common/filters/http-exception-filter";
import { LoggerAction } from '@eqxjs/stub';
import { CustomLoggerService } from './loggers/logger.service';
import { JwtService } from "@nestjs/jwt";
import { useContainer } from "class-validator";
import { MetricsModule } from './prometheus/prometheus.module';
import { ApplicationConfig } from 'assets/config/configuration';

async function bootstrap() {
  const prometheus = await NestFactory.create(MetricsModule);
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(
		new ExceptionsFilterInternalError(app.get(CustomLoggerService), LoggerAction, app.get(JwtService), app.get(ConfigService)),
		new HttpExceptionFilter(app.get(CustomLoggerService))
	);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	const configService = app.get(ConfigService);
  await prometheus.listen(ApplicationConfig.metrics.metrics_port);
  await app.listen(configService.getOrThrow("APP_PORT"));
}
bootstrap();
