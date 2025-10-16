import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DashBoardModule } from '../src/dashboard/dashboard.module';
import { UserRatingModule } from '../src/database/userrating.module';
import request from 'supertest';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { AppModule } from './../src/app.module';
import * as path from 'path';
import * as fs from 'fs'; 
import { join } from 'path';
import { UtilsService } from '../src/utils/utils.services';
import { CustomLoggerService, CustomSummaryLoggerService, FrameworkModule, MessageContextService, CustomAxiosService, LoggerHelperService, INTERNAL_LOGGER_OPTIONS, INTERNAL_OS_NAME } from '@eqxjs/stub';

const initFlow = (detialLogger, messageContextService, message) => {
  const appConfig = UtilsService.getAppConfig();

  detialLogger.init({
    appName: appConfig.appName || '#############',
    guid: message.header.identity.device || '#############',
    sessionId: message.header.session || '#############',
    transactionId: message.header.transaction || '#############',
    componentName: appConfig.componentName || '#############',
    originateServiceName: 'Event Source',
    instance: INTERNAL_OS_NAME,
    recordType: 'detail',
  })
  messageContextService.init(message)
}

describe('AppController (e2e)', () => {
  let detialLogger: CustomLoggerService;
  let messageContextService: MessageContextService;
  let customAxiosService: DeepMocked<CustomAxiosService>;
  //let app: INestApplication<App>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        FrameworkModule.register({
          configPath: join(process.cwd(),
            "assets", "config"),
          zone: 'local'
        }),
        UserRatingModule,
        DashBoardModule
      ],
      providers: [
        CustomLoggerService,
        CustomSummaryLoggerService,
        LoggerHelperService,
        MessageContextService
      ]
    }).compile();

    detialLogger = app.get(CustomLoggerService);
    messageContextService = app.get(MessageContextService);
    customAxiosService = app.get(CustomAxiosService);
  });

  describe('entrypoint', () => {
    it('handleEventExample', async () => {
      // Arrange
      const message = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'test', 'data-mockup', '_example-message.json'), { encoding: 'utf-8' }))
      const message_anti = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'test', 'data-mockup', '_example-request-endpoint.json'), { encoding: 'utf-8' }))
      const message_db = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'test', 'data-mockup', '_example-db.json'), { encoding: 'utf-8' }))
      initFlow(detialLogger, messageContextService, message)
      jest.spyOn(customAxiosService, 'request').mockResolvedValueOnce(message_anti)
      // jest.spyOn(exampleRepo, "create").mockResolvedValueOnce(message_db)

    });
  });
});
