import { Module } from "@nestjs/common";
import { DashBoardController } from "./dashboard.controller";
import { DashBoardService } from "./dashboard.service";
import { UserRatingModule } from "../database/userrating.module";
import { MongoConnectionService } from "../database/mongoconnection.service";
import { TimeStampService } from '../prometheus/timeStamp';
import { MetricsModule } from '../prometheus/prometheus.module';
import { UtilsService } from '../utils/utils.services';
import { CustomLoggerService } from "@eqxjs/stub";
const appConfig = UtilsService.getAppConfig();

@Module({
	imports: appConfig.isDecrypted
    ? [UserRatingModule, MetricsModule] : [MetricsModule],
	controllers: [DashBoardController],
	providers: [DashBoardService, MongoConnectionService, TimeStampService, CustomLoggerService],
})
export class DashBoardModule {}
