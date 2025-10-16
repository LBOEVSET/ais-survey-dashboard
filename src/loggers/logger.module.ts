import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomLoggerService } from './logger.service';
import { LOGGER_ACTION, LoggerAction } from './logger.action';


@Module({
    imports: [
        ConfigModule
    ],
    providers: [
        CustomLoggerService, 
        ConfigService, 
        { provide: LOGGER_ACTION, useValue: LoggerAction }
    ],
    exports: [
        CustomLoggerService
    ],
})
export class LoggerModule {}
