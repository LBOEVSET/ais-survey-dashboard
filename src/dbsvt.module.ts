import { Module } from '@nestjs/common';
import { DashBoardController } from './dashboard/dashboard.controller';
import { DashBoardService } from './dashboard/dashboard.service';
import { MetricsModule } from './prometheus/prometheus.module';
import { TimeStampService } from './prometheus/timeStamp';
import { UtilsService } from './utils/utils.services';
import { MongooseModule } from '@nestjs/mongoose';
import { DashBoardModule } from './dashboard/dashboard.module';
import { LoggerModule } from './loggers/logger.module';
import { MongoConnectionService } from "./database/mongoconnection.service";
import { AuthenticationModule } from './authentication/authentication.module';
const appConfig = UtilsService.getAppConfig();
const dbConfig = UtilsService.getDBConfig();

@Module({
  imports: appConfig.isDecrypted
    ? [ 
      AuthenticationModule,
      MetricsModule,
      DashBoardModule,
      LoggerModule,
      MongooseModule.forRoot(dbConfig.survey[0].mongoUrl, {
        connectionName: 'survey_0',
        serverSelectionTimeoutMS: 10000,
      }),
      MongooseModule.forRoot(dbConfig.master[0].mongoUrl, { 
        connectionName: 'master_0',
        serverSelectionTimeoutMS: 10000,
      }),
    ] : [MetricsModule, DashBoardModule, LoggerModule],

  controllers: [DashBoardController],//DashBoardController],
  providers: [
    DashBoardService,
    TimeStampService,
    MongoConnectionService
  ],
})
export class DBSVTModule { }
